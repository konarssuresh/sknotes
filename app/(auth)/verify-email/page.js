import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailPanel } from "@/features/auth/verify-email-panel";
import { getSession, isEmailVerified } from "@/lib/auth/session";

export const metadata = {
  title: "Verify email — SKNotes",
};

export default async function VerifyEmailPage() {
  const session = await getSession();
  if (session?.user?.id && isEmailVerified(session.user)) {
    redirect("/");
  }
  return (
    <AuthCard title="Verify your email">
      <Suspense
        fallback={
          <p className="text-body-sm text-muted-foreground">Loading…</p>
        }
      >
        <VerifyEmailPanel />
      </Suspense>
    </AuthCard>
  );
}
