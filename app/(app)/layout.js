import { AppShell } from "@/components/app-shell/app-shell";
import { requireVerifiedSession } from "@/lib/auth/session";

export const instant = false;

export default async function AppLayout({ children }) {
  await requireVerifiedSession();
  return <AppShell>{children}</AppShell>;
}
