import Sidebar from "../_components/sidebar";
import AuthGuard from "../_components/admin";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
  <div style={{ display: "flex" }}>
    <Sidebar />
    <main style={{ flex: 1, position: "relative", minHeight: "100vh" }}>{children}</main>
  </div>
    </AuthGuard>
  );
}