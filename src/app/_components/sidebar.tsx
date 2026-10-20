"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [aberto, setAberto] = useState(false);
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

  async function sair() {
    setSaindo(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <div className={styles.topbarMobile}>
        <img src={imagemMinistry.src} alt="MinistryHub" />
        <button className={styles.hamburger} onClick={() => setAberto(true)} aria-label="Abrir menu">
          ☰
        </button>
      </div>

      {aberto && <div className={styles.overlay} onClick={() => setAberto(false)} />}

      <header className={`${styles.header} ${aberto ? styles.aberto : ""}`}>
        <button className={styles.fecharMobile} onClick={() => setAberto(false)} aria-label="Fechar menu">
          ✕
        </button>

        <div className={styles.logoministry}>
          <img src={imagemMinistry.src} alt="MinistryHub" />
        </div>

        <div className={styles.secao}>
          <span className={styles.secaoTitulo}>Geral</span>
          <a href="/inicio" className={ativo("/inicio") ? styles.ativo : ""}>Tabela</a>
          <a href="/disponibilidade" className={ativo("/disponibilidade") ? styles.ativo : ""}>Disponível</a>
        </div>

        {isAdmin && (
          <div className={styles.secao}>
            <span className={styles.secaoTitulo}>Administração</span>
            <a href="/cultos" className={ativo("/cultos") ? styles.ativo : ""}>Cultos</a>
            <a href="/gerar-escala" className={ativo("/gerar-escala") ? styles.ativo : ""}>Escala</a>
            <a href="/ministerios" className={ativo("/ministerios") ? styles.ativo : ""}>Ministério</a>
            <a href="/modelos-culto" className={ativo("/modelos-culto") ? styles.ativo : ""}>Modelos</a>
            <a href="/vagas-culto" className={ativo("/vagas-culto") ? styles.ativo : ""}>Vagas</a>
            <a href="/atribuir-ministerio" className={ativo("/atribuir-ministerio") ? styles.ativo : ""}>Atribuir</a>
            <a href="/configurar-escala" className={ativo("/configurar") ? styles.ativo : ""}>Assistente</a>
          </div>
        )}

        <button className={styles.botaoSair} onClick={sair} disabled={saindo}>
          {saindo ? "Saindo..." : "Sair"}
        </button>
      </header>
    </>
  );
}