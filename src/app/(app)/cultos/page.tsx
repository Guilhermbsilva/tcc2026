// src/app/(app)/cultos/page.tsx
import Cultos from "../../_components/cultos";
import AuthGuard from "../../_components/admin";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <Cultos />
    </AuthGuard>
  );
}