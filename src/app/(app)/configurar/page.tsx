// src/app/(app)/cultos/page.tsx
import Config from "../../_components/wizard-configuracao";
import AuthGuard from "../../_components/admin";

export const metadata = { title: "Assistente" };

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <Config />
    </AuthGuard>
  );
}