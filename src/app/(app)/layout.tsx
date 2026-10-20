import Sidebar from "../_components/sidebar";
import AuthGuard from "../_components/admin";
import styles from "./layout.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "MinistryHub",
    template: "%s | MinistryHub",
  },
  description: "Gerador automático de escalas para ministérios",
};

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