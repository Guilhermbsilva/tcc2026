"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { gerarEscala } from "@/lib/gerar-escala";
import styles from "./gerar-escala.module.css";

type Culto = { id: string; dia: string; descricao: string | null };

type ItemResumo = {
  tipo: "sucesso" | "aviso" | "erro";
  texto: string;
};

export default function GerarEscala() {
  const [pendentes, setPendentes] = useState<{ culto: Culto; ministerioId: string; ministerioNome: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [resumo, setResumo] = useState<ItemResumo[]>([]);

  useEffect(() => {
    carregarPendentes();
  }, []);

  async function carregarPendentes() {
    setCarregando(true);

    // busca todas as combinações culto+ministério que têm vagas definidas
    const { data: vagas } = await supabase
      .from("cultos_funcao")
      .select("culto_id, ministerio_id");

    if (!vagas || vagas.length === 0) {
      setPendentes([]);
      setCarregando(false);
      return;
    }

    // deduplica combinações
    const combinacoesUnicas = Array.from(
      new Map(vagas.map((v) => [`${v.culto_id}-${v.ministerio_id}`, v])).values()
    );

    // busca quais já têm escala gerada
    const { data: escalasExistentes } = await supabase
      .from("escalas")
      .select("culto_id, ministerio_id");

    const jaGeradas = new Set(
      (escalasExistentes ?? []).map((e) => `${e.culto_id}-${e.ministerio_id}`)
    );

    const combinacoesPendentes = combinacoesUnicas.filter(
      (c) => !jaGeradas.has(`${c.culto_id}-${c.ministerio_id}`)
    );

    if (combinacoesPendentes.length === 0) {
      setPendentes([]);
      setCarregando(false);
      return;
    }

    // busca dados dos cultos e ministérios envolvidos pra exibir nome/data
    const idsCultos = [...new Set(combinacoesPendentes.map((c) => c.culto_id))];
    const idsMinisterios = [...new Set(combinacoesPendentes.map((c) => c.ministerio_id))];

    const { data: cultosData } = await supabase
      .from("cultos")
      .select("id, dia, descricao")
      .in("id", idsCultos);

    const { data: ministeriosData } = await supabase
      .from("ministerios")
      .select("id, ministerio")
      .in("id", idsMinisterios);

    const mapaCultos = new Map((cultosData ?? []).map((c) => [c.id, c]));
    const mapaMinisterios = new Map((ministeriosData ?? []).map((m) => [m.id, m.ministerio]));

    const lista = combinacoesPendentes
      .map((c) => {
        const culto = mapaCultos.get(c.culto_id);
        const ministerioNome = mapaMinisterios.get(c.ministerio_id);
        if (!culto || !ministerioNome) return null;
        return { culto, ministerioId: c.ministerio_id, ministerioNome };
      })
      .filter((c): c is { culto: Culto; ministerioId: string; ministerioNome: string } => c !== null)
      .sort((a, b) => a.culto.dia.localeCompare(b.culto.dia));

    setPendentes(lista);
    setCarregando(false);
  }

  async function gerarTodas() {
    setGerando(true);
    setResumo([]);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setResumo([{ tipo: "erro", texto: "Usuário não autenticado." }]);
      setGerando(false);
      return;
    }

    const { data: usuarioAdmin } = await supabase
      .from("usuario")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!usuarioAdmin) {
      setResumo([{ tipo: "erro", texto: "Usuário não encontrado." }]);
      setGerando(false);
      return;
    }

    const novoResumo: ItemResumo[] = [];

    for (const item of pendentes) {
      const dataFormatada = new Date(item.culto.dia + "T00:00:00").toLocaleDateString("pt-BR");
      const rotulo = `${dataFormatada} — ${item.ministerioNome}`;

      try {
        const resultado = await gerarEscala(item.culto.id, item.ministerioId, usuarioAdmin.id);

        novoResumo.push({
          tipo: resultado.avisos.length > 0 ? "aviso" : "sucesso",
          texto:
            resultado.avisos.length > 0
              ? `${rotulo}: gerada com avisos — ${resultado.avisos.join(" ")}`
              : `${rotulo}: gerada com sucesso (${resultado.escalados.length} escalado(s)).`,
        });
      } catch (e: any) {
        novoResumo.push({
          tipo: "erro",
          texto: `${rotulo}: erro ao gerar — ${e.message ?? "erro desconhecido"}`,
        });
      }
    }

    setResumo(novoResumo);
    setGerando(false);
    await carregarPendentes();
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <div className={`${styles.card} ${styles.cardAcao}`}>
          <p className={styles.titulo}>Gerar Escalas</p>

          {carregando ? (
            <p>Verificando pendências...</p>
          ) : pendentes.length === 0 ? (
            <p className={styles.contadorPendentes}>Nenhuma escala pendente no momento.</p>
          ) : (
            <p className={styles.contadorPendentes}>
              {pendentes.length} escala(s) pendente(s) de geração
            </p>
          )}

          <button
            className={styles.botaoPrincipal}
            onClick={gerarTodas}
            disabled={gerando || pendentes.length === 0}
          >
            {gerando ? "Gerando..." : "Gerar escalas pendentes"}
          </button>

          <a href="/inicio" className={styles.linkInicio}>
            Ver todas as escalas geradas →
          </a>
        </div>

        <div className={`${styles.card} ${styles.cardResumo}`}>
          <p className={styles.titulo}>Resultado</p>

          {resumo.length === 0 ? (
            <p className={styles.vazio}>
              O resultado da última geração aparece aqui. Para ver as escalas já geradas, acesse a tela Início.
            </p>
          ) : (
            <ul className={styles.listaResumo}>
              {resumo.map((item, i) => (
                <li
                  key={i}
                  className={`${styles.itemResumo} ${
                    item.tipo === "sucesso"
                      ? styles.itemSucesso
                      : item.tipo === "aviso"
                      ? styles.itemAviso
                      : styles.itemErro
                  }`}
                >
                  {item.texto}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}