// src/app/vagas-culto/page.tsx
import VagasCulto from "../_components/vagas-culto";
import AuthGuard from "../_components/admin";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <VagasCulto />
    </AuthGuard>
  );
}