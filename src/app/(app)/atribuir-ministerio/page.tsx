// src/app/(app)/cultos/page.tsx
import Atribuir from "../../_components/atribuir-ministerio";
import AuthGuard from "../../_components/admin";

export const metadata = { title: "Atribuir" };

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <Atribuir />
    </AuthGuard>
  );
}