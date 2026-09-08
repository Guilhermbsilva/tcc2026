"use client";

import { useForm } from "react-hook-form";
import { cultoSchema } from "../_schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import styles from "./cultos.module.css";

type Culto = {
  id: number;
  dia: string;
  descricao: string | null;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function chaveMes(dia: string) {
  const d = new Date(dia + "T00:00:00");
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function nomeMes(chave: string) {
  const [ano, mes] = chave.split("-").map(Number);
  return `${MESES[mes]} ${ano}`;
}

export default function Cultos() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [mesesAbertos, setMesesAbertos] = useState<Set<string>>(new Set());

  const { register, handleSubmit, formState: { errors } } = useForm<cultoSchema>({
    resolver: zodResolver(cultoSchema),
  });

  async function carregarCultos() {
    const { data, error } = await supabase
      .from("cultos")
      .select("*")
      .order("dia", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setCultos(data ?? []);

    if (data && data.length > 0) {
      setMesesAbertos((prev) => {
        if (prev.size > 0) return prev;
        return new Set([chaveMes(data[0].dia)]);
      });
    }
  }

  async function onSubmit(data: cultoSchema) {
    const { error: insertError } = await supabase
      .from("cultos")
      .insert([{ dia: data.dia, descricao: data.descricao || null }]);

    if (insertError) {
      console.error(insertError);
      return;
    }

    await carregarCultos();
  }

  async function removerCulto(id: number) {
    const confirmar = window.confirm("Tem certeza que deseja remover este culto? Isso também vai apagar vagas, disponibilidades e escalas ligadas a ele.");
    if (!confirmar) return;

    const { error } = await supabase.from("cultos").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao remover culto. Verifique o console.");
      return;
    }

    await carregarCultos();
  }

  function alternarMesAberto(chave: string) {
    setMesesAbertos((prev) => {
      const novo = new Set(prev);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  useEffect(() => {
    carregarCultos();
  }, []);

  const grupos = new Map<string, Culto[]>();
  cultos.forEach((c) => {
    const chave = chaveMes(c.dia);
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(c);
  });

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <div className={`${styles.card} ${styles.cardCriar}`}>
          <p className={styles.titulo}>Criar Cultos</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input type="date" {...register("dia")} />
              {errors?.dia && <span>{errors.dia.message}</span>}
            </div>

            <div>
              <input type="text" placeholder="Descrição (opcional)" {...register("descricao")} />
              {errors?.descricao && <span>{errors.descricao.message}</span>}
            </div>

            <button className={styles.botaoPrincipal} type="submit">Criar</button>
          </form>
        </div>

        <div className={`${styles.card} ${styles.cardCultos}`}>
          <p className={styles.titulo}>Cultos cadastrados</p>

          {cultos.length === 0 ? (
            <p className={styles.vazio}>Nenhum culto cadastrado.</p>
          ) : (
            Array.from(grupos.entries()).map(([chave, cultosDoMes]) => {
              const aberto = mesesAbertos.has(chave);

              return (
                <div key={chave} className={styles.grupoMes}>
                  <div className={styles.mesHeader} onClick={() => alternarMesAberto(chave)}>
                    {nomeMes(chave)} {aberto ? "▾" : "▸"}
                  </div>

                  {aberto && (
                    <ul className={styles.listaC}>
                      {cultosDoMes.map((culto) => (
                        <li key={culto.id} className={styles.listaCulto}>
                          <div className={styles.linhaTopo}>
                            <span className={styles.dataCulto}>
                              {new Date(culto.dia + "T00:00:00").toLocaleDateString("pt-BR")}
                            </span>
                            <button
                              type="button"
                              className={styles.btnRemover}
                              onClick={() => removerCulto(culto.id)}
                              aria-label="Remover culto"
                            >
                              ✕
                            </button>
                          </div>
                          {culto.descricao && (
                            <span className={styles.descricaoCulto}>{culto.descricao}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}