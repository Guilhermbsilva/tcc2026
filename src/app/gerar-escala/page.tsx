import GerarEscala from "../_components/gerar-escala";
import AuthGuard from "../_components/admin";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <GerarEscala />
    </AuthGuard>
  );
}