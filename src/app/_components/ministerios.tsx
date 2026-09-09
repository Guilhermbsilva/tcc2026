"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ministerioSchema, MinisterioSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import styles from "./ministerios.module.css";
import Spinner from "./spinner";

type Ministerio = {
  id: string;
  ministerio: string;
  descricao: string | null;
};

export default function Ministerios() {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MinisterioSchema>({
    resolver: zodResolver(ministerioSchema),
  });

  useEffect(() => {
    carregarMinisterios();
  }, []);

  async function carregarMinisterios() {
    const { data, error } = await supabase
      .from("ministerios")
      .select("*")
      .order("ministerio", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setMinisterios(data ?? []);
  }

  async function onSubmit(data: MinisterioSchema) {
    setMensagem(null);
    setSalvando(true);

    const { error } = await supabase
      .from("ministerios")
      .insert([{ ministerio: data.ministerio, descricao: data.descricao || null }]);

    if (error) {
      console.error(error);
      setMensagem("Erro ao criar ministério. Talvez já exista um com esse nome.");
      setSalvando(false);
      return;
    }

    setMensagem("Ministério criado com sucesso!");
    reset();
    await carregarMinisterios();
    setSalvando(false);
  }

  async function remover(id: string) {
  const confirmar = window.confirm(
    "Remover este ministério? Isso também vai apagar todos os vínculos de usuários, templates, vagas e escalas relacionadas a ele."
  );
  if (!confirmar) return;

  setRemovendoId(id);

  const { error } = await supabase.from("ministerios").delete().eq("id", id);

  if (error) {
    console.error(error);
    alert("Erro ao remover ministério. Verifique o console.");
    setRemovendoId(null);
    return;
  }

  await carregarMinisterios();
  setRemovendoId(null);
}

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <div className={`${styles.card} ${styles.cardCriar}`}>
          <p className={styles.titulo}>Criar Ministérios</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input type="text" placeholder="Nome do ministério (ex: música)" {...register("ministerio")} disabled={salvando} />
              {errors?.ministerio && <span>{errors.ministerio.message}</span>}
            </div>

            <div>
              <input type="text" placeholder="Descrição (opcional)" {...register("descricao")} disabled={salvando} />
              {errors?.descricao && <span>{errors.descricao.message}</span>}
            </div>

            <button className={styles.botaoPrincipal} type="submit" disabled={salvando}>
              {salvando ? (<><Spinner /> Criando...</>) : "Criar"}
            </button>
          </form>

          {mensagem && <p>{mensagem}</p>}
        </div>

        <div className={`${styles.card} ${styles.cardLista}`}>
          <p className={styles.titulo}>Ministérios cadastrados</p>

          {ministerios.length === 0 ? (
            <p className={styles.vazio}>Nenhum ministério cadastrado.</p>
          ) : (
            <ul className={styles.listaC}>
              {ministerios.map((m) => (
                <li key={m.id} className={styles.listaCulto}>
                  <span>{m.ministerio}{m.descricao && ` — ${m.descricao}`}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remover(m.id)}
                    disabled={removendoId === m.id}
                  >
                    {removendoId === m.id ? <Spinner /> : "Remover"}
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