import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailPanel } from "@/features/auth/verify-email-panel";

export const metadata = {
  title: "Verify email — SKNotes",
};

export default function VerifyEmailPage() {
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
