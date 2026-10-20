import Sidebar from "../_components/sidebar";
import AuthGuard from "../_components/admin";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </AuthGuard>
  );
}