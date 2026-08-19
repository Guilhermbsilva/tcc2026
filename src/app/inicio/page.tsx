import Inicio from "../_components/inicio";
import AuthGuard from "../_components/admin";

export default function Page() {
  return (
    <AuthGuard>
      <Inicio />
    </AuthGuard>
  );
}