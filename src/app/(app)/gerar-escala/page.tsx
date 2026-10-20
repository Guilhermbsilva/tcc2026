// src/app/(app)/cultos/page.tsx
import GerarEscala from "../../_components/gerar-escala";
import AuthGuard from "../../_components/admin";

export const metadata = { title: "Gerar Escala" };

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <GerarEscala />
    </AuthGuard>
  );
}