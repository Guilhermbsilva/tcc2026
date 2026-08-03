import Ministerios from "../_components/ministerios";
import AuthGuard from "../_components/admin";

export default function Page() {
  return (
    <AuthGuard adminOnly>
      <Ministerios />
    </AuthGuard>
  );
}