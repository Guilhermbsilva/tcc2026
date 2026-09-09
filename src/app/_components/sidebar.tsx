"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

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

  function ativo(caminho: string) {
    return pathname === caminho || pathname?.startsWith(caminho + "/");
  }

  return (
    <header className={styles.header}>
      <div className={styles.logoministry}>
        <img src={imagemMinistry.src} alt="MinistryHub" />
      </div>

      <div className={styles.secao}>
        <span className={styles.secaoTitulo}>Geral</span>
        <a href="/inicio" className={ativo("/inicio") ? styles.ativo : ""}>Escala</a>
        <a href="/disponibilidade" className={ativo("/disponibilidade") ? styles.ativo : ""}>Disponível</a>
      </div>

      {isAdmin && (
        <div className={styles.secao}>
          <span className={styles.secaoTitulo}>Administração</span>
          <a href="/ministerios" className={ativo("/ministerios") ? styles.ativo : ""}>Ministério</a>
          <a href="/modelos-culto" className={ativo("/modelos-culto") ? styles.ativo : ""}>Modelos</a>
          <a href="/atribuir-ministerio" className={ativo("/atribuir-ministerio") ? styles.ativo : ""}>Atribuir</a>
          <a href="/cultos" className={ativo("/cultos") ? styles.ativo : ""}>Cultos</a>
          <a href="/vagas-culto" className={ativo("/vagas-culto") ? styles.ativo : ""}>Vagas</a>
          <a href="/gerar-escala" className={ativo("/gerar-escala") ? styles.ativo : ""}>Escala</a>
          <a href="/configurar" className={ativo("/configurar-escala") ? styles.ativo : ""}>Assistente</a>
          <a href="/funcoes" className={ativo("/funcoes") ? styles.ativo : ""}>Funções</a>
        </div>
      )}
    </header>
  );
}