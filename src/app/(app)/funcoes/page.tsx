import Funcoes from "../../_components/funcoes";
import AuthGuard from "../../_components/admin";

export const metadata = { title: "Funções" };

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <Funcoes />
    </AuthGuard>
  );
}