"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vincularMinisterioSchema, VincularMinisterioSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import styles from "./atribuir-ministerio.module.css";

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
      return;
    }

    setMensagem("Vínculo criado com sucesso!");
    reset();
    await carregarVinculos();
  }

  async function remover(id: string) {
    const { error } = await supabase
      .from("usuario_ministerio")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error(error);
      return;
    }

    await carregarVinculos();
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
      <div className={styles.forms}>
        <p className={styles.titulo}>Atribuir Ministério</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <select {...register("usuario_id")}>
              <option value="">Selecione o usuário</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
            {errors?.usuario_id && <span>{errors.usuario_id.message}</span>}
          </div>

          <div>
            <select {...register("ministerio_id")}>
              <option value="">Selecione o ministério</option>
              {ministerios.map((m) => (
                <option key={m.id} value={m.id}>{m.ministerio}</option>
              ))}
            </select>
            {errors?.ministerio_id && <span>{errors.ministerio_id.message}</span>}
          </div>

          <div>
            <input type="text" placeholder="Função (ex: guitarrista, cantor)" {...register("funcao")} />
            {errors?.funcao && <span>{errors.funcao.message}</span>}
          </div>

          <button className={styles.botaoPrincipal} type="submit">Atribuir</button>
        </form>

        {mensagem && <p>{mensagem}</p>}

        <div>
          <h3 className={styles.subtitulo}>Atribuições</h3>

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
              <details key={nomeMinisterio} open style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 16, padding: "8px 0" }}>
                  {nomeMinisterio} ({itens.length})
                </summary>

                <ul>
                  {itens.map((v) => (
                    <li key={v.id} className={styles.listaCulto}>
                      {v.usuario?.nome} — {v.funcao}
                      <Button type="button" variant="destructive" onClick={() => remover(v.id)}>
                        Remover
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