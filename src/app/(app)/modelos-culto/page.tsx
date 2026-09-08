// src/app/(app)/cultos/page.tsx
import ModelosCulto from "../../_components/modelo-cultos";
import AuthGuard from "../../_components/admin";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <ModelosCulto />
    </AuthGuard>
  );
}