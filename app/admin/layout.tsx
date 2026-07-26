import { AdminDataProvider } from "./admin-context";
import { AdminShell } from "./admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  );
}
