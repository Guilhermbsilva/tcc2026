// src//(app)/cultos/page.tsx
import VagasCulto from "../../_components/vagas-culto";
import AuthGuard from "../../_components/admin";

export const metadata = { title: "Vagas Culto" };

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <VagasCulto />
    </AuthGuard>
  );
}