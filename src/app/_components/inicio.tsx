"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./inicio.module.css";

type Colega = { usuario_id: string; nome: string };

type CardEscala = {
  escalaId: string;
  cultoDia: string;
  cultoDescricao: string | null;
  ministerio: string;
  equipe: Colega[];
};

const CORES = ["#18181b", "#ef4444", "#0ea5e9", "#22c55e", "#eab308", "#a855f7"];

export default function Inicio() {
  const [cards, setCards] = useState<CardEscala[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: usuario } = await supabase
      .from("usuario")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!usuario) return;

    // escalas em que EU estou
    const { data: minhasEscalas } = await supabase
      .from("escala_usuario")
      .select("escala_id, escalas(id, culto_id, ministerio_id, cultos(dia, descricao), ministerios(ministerio))")
      .eq("usuario_id", usuario.id);

    if (!minhasEscalas || minhasEscalas.length === 0) {
      setCarregando(false);
      return;
    }

    const cardsMontados: CardEscala[] = [];

    for (const item of minhasEscalas as any[]) {
      const escala = item.escalas;
      if (!escala) continue;

      // busca todo mundo que está nessa mesma escala (a equipe)
      const { data: equipeData } = await supabase
        .from("escala_usuario")
        .select("usuario_id, usuario(nome)")
        .eq("escala_id", escala.id);

      const equipe: Colega[] = (equipeData ?? []).map((e: any) => ({
        usuario_id: e.usuario_id,
        nome: e.usuario?.nome ?? "?",
      }));

      cardsMontados.push({
        escalaId: escala.id,
        cultoDia: escala.cultos?.dia,
        cultoDescricao: escala.cultos?.descricao ?? null,
        ministerio: escala.ministerios?.ministerio ?? "",
        equipe,
      });
    }

    // ordena pela data do culto
    cardsMontados.sort((a, b) => a.cultoDia.localeCompare(b.cultoDia));

    setCards(cardsMontados);
    setCarregando(false);
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.tituloPagina}>Minhas escalas</h1>

      {cards.length === 0 ? (
        <p>Você ainda não está escalado em nenhum culto.</p>
      ) : (
        <div className={styles.grid}>
          {cards.map((card) => (
            <div key={card.escalaId} className={styles.card}>
              <p className={styles.cardTitulo}>
                {card.cultoDescricao ?? "Culto"}
              </p>
              <p className={styles.cardData}>
                {new Date(card.cultoDia + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
              <p className={styles.cardMinisterio}>{card.ministerio}</p>

              <div className={styles.avatares}>
                {card.equipe.map((colega, i) => (
                  <div
                    key={colega.usuario_id}
                    className={styles.avatar}
                    style={{ backgroundColor: CORES[i % CORES.length] }}
                    title={colega.nome}
                  >
                    {colega.nome.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}