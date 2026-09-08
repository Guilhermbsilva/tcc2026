"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usuario } = await supabase
        .from("usuario")
        .select("cargo")
        .eq("email", user.email)
        .single();

      setIsAdmin(usuario?.cargo === "admin");
    }
    verificar();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.logoministry}>
        <img src={imagemMinistry.src} alt="MinistryHub" />
      </div>

      <a href="/inicio">Início</a>
      <a href="/disponibilidade">Disponível</a>

      {isAdmin && (
        <>
          <a href="/cultos">Cultos</a>
          <a href="/gerar-escala">Escala</a>
          <a href="/ministerios">Ministério</a>
          <a href="/modelos-culto">Modelos</a>
          <a href="/vagas-culto">Vagas</a>
          <a href="/atribuir-ministerio">Atribuir</a>
          <a href="/configurar-escala">Assistente</a>
        </>
      )}

      <a href="/tabela">Tabela</a>
    </header>
  );
}