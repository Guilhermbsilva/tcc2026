import Atribuirministerio from "../_components/atribuir-ministerio";
import AuthGuard from "../_components/admin";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <Atribuirministerio />
    </AuthGuard>
  );
}