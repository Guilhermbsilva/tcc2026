"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import "./geral.css";

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
          router.push("/"); // depois pode trocar por uma página de "acesso negado"
          return;
        }
      }

      setAutorizado(true);
      setCarregando(false);
    }

    verificar();
  }, [router, adminOnly]);

  if (carregando) return <p>Carregando...</p>;
  if (!autorizado) return null;

  return <>{children}</>;
}