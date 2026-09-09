import Funcoes from "../../_components/funcoes";
import AuthGuard from "../../_components/auth-guard";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <Funcoes />
    </AuthGuard>
  );
}