import { AppShell } from "@/components/app-shell/app-shell";
import { QueryProvider } from "@/components/providers/query-provider";
import { requireVerifiedSession } from "@/lib/auth/session";

export const instant = false;

export default async function AppLayout({ children }) {
  await requireVerifiedSession();
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  );
}
