"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthGuardProps = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

export default function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (adminOnly) {
        const { data: usuario, error } = await supabase
          .from("usuario")
          .select("cargo")
          .eq("email", user.email)
          .single();

        if (error || usuario?.cargo !== "admin") {
          alert("Você não tem permissão para acessar essa página.");
          const ultimaPagina = sessionStorage.getItem("ultima_pagina_permitida") || "/inicio";
          router.push(ultimaPagina);
          return;
        }
      }

      // chegou até aqui = tem permissão pra estar nessa página, então guarda como "última página válida"
      sessionStorage.setItem("ultima_pagina_permitida", window.location.pathname);

      setAutorizado(true);
      setCarregando(false);
    }

    verificar();
  }, [router, adminOnly]);

  if (carregando) return <p>Carregando...</p>;
  if (!autorizado) return null;

  return <>{children}</>;
}