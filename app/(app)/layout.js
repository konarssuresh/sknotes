import { AppShell } from "@/components/app-shell/app-shell";
import { requireSession } from "@/lib/auth/session";

export const instant = false;

export default async function AppLayout({ children }) {
  await requireSession();
  return <AppShell>{children}</AppShell>;
}
