"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vincularMinisterioSchema, VincularMinisterioSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import styles from "./atribuir-ministerio.module.css";
import Spinner from "./spinner";

type Usuario = { id: string; nome: string };
type Ministerio = { id: string; ministerio: string };
type Vinculo = {
  id: string;
  funcao: string;
  usuario: { nome: string } | null;
  ministerios: { ministerio: string } | null;
};

export default function AtribuirMinisterio() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VincularMinisterioSchema>({
    resolver: zodResolver(vincularMinisterioSchema),
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data: usuariosData } = await supabase
      .from("usuario")
      .select("id, nome")
      .order("nome", { ascending: true });

    setUsuarios(usuariosData ?? []);

    const { data: ministeriosData } = await supabase
      .from("ministerios")
      .select("id, ministerio")
      .order("ministerio", { ascending: true });

    setMinisterios(ministeriosData ?? []);

    await carregarVinculos();
  }

  async function carregarVinculos() {
    const { data, error } = await supabase
      .from("usuario_ministerio")
      .select("id, funcao, usuario(nome), ministerios(ministerio)");

    if (error) {
      console.error(error);
      return;
    }

    setVinculos((data as any) ?? []);
  }

  async function onSubmit(data: VincularMinisterioSchema) {
    setMensagem(null);
    setSalvando(true);

    const { error } = await supabase
      .from("usuario_ministerio")
      .insert([
        {
          usuario_id: data.usuario_id,
          ministerio_id: data.ministerio_id,
          funcao: data.funcao,
        },
      ]);

    if (error) {
      console.error(error);
      setMensagem("Erro ao vincular. Verifique se esse vínculo já existe.");
      setSalvando(false);
      return;
    }

    setMensagem("Vínculo criado com sucesso!");
    reset();
    await carregarVinculos();
    setSalvando(false);
  }

  async function remover(id: string) {
    setRemovendoId(id);

    const { error } = await supabase
      .from("usuario_ministerio")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error(error);
      setRemovendoId(null);
      return;
    }

    await carregarVinculos();
    setRemovendoId(null);
  }

  const vinculosFiltrados = vinculos.filter((v) =>
    v.usuario?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const grupos = Array.from(
    vinculosFiltrados.reduce((mapa, v) => {
      const nomeMinisterio = v.ministerios?.ministerio ?? "Sem ministério";
      if (!mapa.has(nomeMinisterio)) {
        mapa.set(nomeMinisterio, []);
      }
      mapa.get(nomeMinisterio)!.push(v);
      return mapa;
    }, new Map<string, Vinculo[]>())
  ).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <div className={`${styles.card} ${styles.cardCriar}`}>
          <p className={styles.titulo}>Atribuir Ministério</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <select {...register("usuario_id")} disabled={salvando}>
              <option value="">Selecione o usuário</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
            {errors?.usuario_id && <span>{errors.usuario_id.message}</span>}

            <select {...register("ministerio_id")} disabled={salvando}>
              <option value="">Selecione o ministério</option>
              {ministerios.map((m) => (
                <option key={m.id} value={m.id}>{m.ministerio}</option>
              ))}
            </select>
            {errors?.ministerio_id && <span>{errors.ministerio_id.message}</span>}

            <input type="text" placeholder="Função (ex: guitarrista, cantor)" {...register("funcao")} disabled={salvando} />
            {errors?.funcao && <span>{errors.funcao.message}</span>}

            <button className={styles.botaoPrincipal} type="submit" disabled={salvando}>
              {salvando ? (<><Spinner /> Atribuindo...</>) : "Atribuir"}
            </button>
          </form>

          {mensagem && <p>{mensagem}</p>}
        </div>

        <div className={`${styles.card} ${styles.cardLista}`}>
          <p className={styles.titulo}>Atribuições</p>

          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {grupos.length === 0 ? (
            <p>Nenhuma atribuição encontrada.</p>
          ) : (
            grupos.map(([nomeMinisterio, itens]) => (
              <details key={nomeMinisterio} open className={styles.grupoDetails}>
                <summary>{nomeMinisterio} ({itens.length})</summary>

                <ul className={styles.listaC}>
                  {itens.map((v) => (
                    <li key={v.id} className={styles.listaCulto}>
                      <span>{v.usuario?.nome} — {v.funcao}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remover(v.id)}
                        disabled={removendoId === v.id}
                      >
                        {removendoId === v.id ? <Spinner /> : "Remover"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
}