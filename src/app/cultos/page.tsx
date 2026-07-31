import Cultos from "../_components/cultos";
import AdminGuard from "../_components/admin";

export default function Page() {
  return (
    <AdminGuard>
      <Cultos />
    </AdminGuard>
  );
}