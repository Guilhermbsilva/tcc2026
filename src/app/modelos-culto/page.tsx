// src/app/templates/page.tsx
import GerenciarTemplates from "../_components/modelo-cultos";
import AuthGuard from "../_components/admin";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <GerenciarTemplates />
    </AuthGuard>
  );
}