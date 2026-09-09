"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { funcaoCadastroSchema, FuncaoCadastroSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import styles from "./funcoes.module.css";
import Spinner from "./spinner";

type Ministerio = { id: string; ministerio: string };
type Funcao = { id: string; nome: string; ministerio_id: string };

export default function Funcoes() {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [ministerioFiltro, setMinisterioFiltro] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FuncaoCadastroSchema>({
    resolver: zodResolver(funcaoCadastroSchema),
  });

  useEffect(() => {
    carregarMinisterios();
    carregarFuncoes();
  }, []);

  async function carregarMinisterios() {
    const { data } = await supabase.from("ministerios").select("id, ministerio").order("ministerio");
    setMinisterios(data ?? []);
  }

  async function carregarFuncoes() {
    const { data } = await supabase.from("funcoes").select("id, nome, ministerio_id").order("nome");
    setFuncoes(data ?? []);
  }

  async function onSubmit(data: FuncaoCadastroSchema) {
    setMensagem(null);
    setSalvando(true);

    const { error } = await supabase
      .from("funcoes")
      .insert([{ nome: data.nome, ministerio_id: data.ministerio_id }]);

    if (error) {
      console.error(error);
      setMensagem("Erro ao criar função. Talvez já exista nesse ministério.");
      setSalvando(false);
      return;
    }

    setMensagem("Função criada com sucesso!");
    reset();
    await carregarFuncoes();
    setSalvando(false);
  }

  async function remover(id: string) {
    setRemovendoId(id);
    const { error } = await supabase.from("funcoes").delete().eq("id", id);

    if (error) {
      console.error(error);
      setRemovendoId(null);
      return;
    }

    await carregarFuncoes();
    setRemovendoId(null);
  }

  function nomeMinisterio(id: string) {
    return ministerios.find((m) => String(m.id) === String(id))?.ministerio ?? "?";
  }

  const funcoesFiltradas = ministerioFiltro
    ? funcoes.filter((f) => String(f.ministerio_id) === String(ministerioFiltro))
    : funcoes;

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <div className={`${styles.card} ${styles.cardCriar}`}>
          <p className={styles.titulo}>Criar Função</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <select {...register("ministerio_id")} disabled={salvando}>
              <option value="">Selecione o ministério</option>
              {ministerios.map((m) => (
                <option key={m.id} value={m.id}>{m.ministerio}</option>
              ))}
            </select>
            {errors?.ministerio_id && <span>{errors.ministerio_id.message}</span>}

            <input type="text" placeholder="Nome da função (ex: guitarrista)" {...register("nome")} disabled={salvando} />
            {errors?.nome && <span>{errors.nome.message}</span>}

            <button className={styles.botaoPrincipal} type="submit" disabled={salvando}>
              {salvando ? (<><Spinner /> Criando...</>) : "Criar"}
            </button>
          </form>

          {mensagem && <p>{mensagem}</p>}
        </div>

        <div className={`${styles.card} ${styles.cardLista}`}>
          <p className={styles.titulo}>Funções cadastradas</p>

          <select value={ministerioFiltro} onChange={(e) => setMinisterioFiltro(e.target.value)}>
            <option value="">Todos os ministérios</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>{m.ministerio}</option>
            ))}
          </select>

          {funcoesFiltradas.length === 0 ? (
            <p className={styles.vazio}>Nenhuma função cadastrada ainda.</p>
          ) : (
            <ul className={styles.listaC}>
              {funcoesFiltradas.map((f) => (
                <li key={f.id} className={styles.listaCulto}>
                  <span>{f.nome} — {nomeMinisterio(f.ministerio_id)}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remover(f.id)}
                    disabled={removendoId === f.id}
                  >
                    {removendoId === f.id ? <Spinner /> : "Remover"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}