"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import styles from "./disponibilidade.module.css";
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png";

type Culto = {
  id: string;
  dia: string;
  descricao: string | null;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function Disponibilidade() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [mesesAbertos, setMesesAbertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuario")
      .select("id")
      .eq("email", user.email)
      .single();

    if (usuarioError || !usuario) {
      console.error(usuarioError);
      return;
    }

    setUsuarioId(usuario.id);

    const { data: cultosData } = await supabase
      .from("cultos")
      .select("*")
      .order("dia", { ascending: true });

    setCultos(cultosData ?? []);

    const { data: disponibilidadesExistentes } = await supabase
      .from("disponibilidades")
      .select("culto_id")
      .eq("usuario_id", usuario.id);

    const jaMarcados = new Set(
      (disponibilidadesExistentes ?? []).map((d) => d.culto_id)
    );
    setSelecionados(jaMarcados);

    // abre automaticamente o primeiro mês que tiver cultos
    if (cultosData && cultosData.length > 0) {
      const primeiraChave = chaveMes(cultosData[0].dia);
      setMesesAbertos(new Set([primeiraChave]));
    }

    setCarregando(false);
  }

  function chaveMes(dia: string) {
    const d = new Date(dia + "T00:00:00");
    return `${d.getFullYear()}-${d.getMonth()}`;
  }

  function nomeMes(chave: string) {
    const [ano, mes] = chave.split("-").map(Number);
    return `${MESES[mes]} ${ano}`;
  }

  function alternar(cultoId: string) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(cultoId)) {
        novo.delete(cultoId);
      } else {
        novo.add(cultoId);
      }
      return novo;
    });
  }

  function alternarMesAberto(chave: string) {
    setMesesAbertos((prev) => {
      const novo = new Set(prev);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  function selecionarTodosDoMes(cultosDoMes: Culto[], marcarTudo: boolean) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      cultosDoMes.forEach((c) => {
        if (marcarTudo) novo.add(c.id);
        else novo.delete(c.id);
      });
      return novo;
    });
  }

  async function salvar() {
    if (!usuarioId) return;

    setMensagem(null);

    const { error: deleteError } = await supabase
      .from("disponibilidades")
      .delete()
      .eq("usuario_id", usuarioId);

    if (deleteError) {
      console.error(deleteError);
      setMensagem("Erro ao salvar disponibilidade.");
      return;
    }

    const registros = Array.from(selecionados).map((cultoId) => ({
      usuario_id: usuarioId,
      culto_id: cultoId,
    }));

    if (registros.length > 0) {
      const { error: insertError } = await supabase
        .from("disponibilidades")
        .insert(registros);

      if (insertError) {
        console.error(insertError);
        setMensagem("Erro ao salvar disponibilidade.");
        return;
      }
    }

    setMensagem("Disponibilidade salva com sucesso!");
  }

  if (carregando) return <p>Carregando...</p>;

  // agrupa os cultos por mês
  const grupos = new Map<string, Culto[]>();
  cultos.forEach((c) => {
    const chave = chaveMes(c.dia);
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(c);
  });

  return (
  <div className={styles.pagina}>
      <div className={styles.forms}>
        <div className={styles.topo}>
          <p className={styles.titulo}>Minha disponibilidade</p>
          {cultos.length > 0 && (
            <p className={styles.contador}>
              {selecionados.size} de {cultos.length} selecionados
            </p>
          )}
        </div>

        <div className={styles.listaScroll}>
          {cultos.length === 0 ? (
            <p>Nenhum culto cadastrado ainda.</p>
          ) : (
            Array.from(grupos.entries()).map(([chave, cultosDoMes]) => {
              const todosMarcados = cultosDoMes.every((c) => selecionados.has(c.id));
              const aberto = mesesAbertos.has(chave);

              return (
                <div key={chave} className={styles.grupoMes}>
                  <div className={styles.mesHeader} onClick={() => alternarMesAberto(chave)}>
                    <span>{nomeMes(chave)} {aberto ? "▾" : "▸"}</span>
                    <span
                      className={styles.selecionarTodos}
                      onClick={(e) => {
                        e.stopPropagation();
                        selecionarTodosDoMes(cultosDoMes, !todosMarcados);
                      }}
                    >
                      {todosMarcados ? "Desmarcar todos" : "Selecionar todos"}
                    </span>
                  </div>

                  {aberto && (
                    <div className={styles.gridCultos}>
                      {cultosDoMes.map((culto) => (
                        <div
                          key={culto.id}
                          className={`${styles.itemCulto} ${selecionados.has(culto.id) ? styles.itemCultoMarcado : ""}`}
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={selecionados.has(culto.id)}
                              onChange={() => alternar(culto.id)}
                            />
                            {new Date(culto.dia + "T00:00:00").toLocaleDateString("pt-BR")}
                            {culto.descricao && ` — ${culto.descricao}`}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className={styles.rodape}>
          <Button onClick={salvar}>Salvar disponibilidade</Button>
          {mensagem && <p>{mensagem}</p>}
        </div>
      </div>
      </div>
  );
}