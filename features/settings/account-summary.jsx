"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { authClient } from "@/lib/auth/auth-client";

function formatAuthProviders(providerIds) {
  const labels = [];
  if (providerIds.has("google")) {
    labels.push("Google");
  }
  if (providerIds.has("credential")) {
    labels.push("Email and password");
  }
  if (labels.length === 0) {
    return "Sign-in method unavailable";
  }
  return labels.join(" · ");
}

export function AccountSummary() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;
  const [accountsState, setAccountsState] = useState({
    userId: null,
    providerIds: null,
    error: "",
  });

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      return;
    }

    let cancelled = false;

    void authClient.listAccounts().then(({ data, error }) => {
      if (cancelled) {
        return;
      }
      if (error) {
        setAccountsState({
          userId,
          providerIds: new Set(),
          error:
            error.message || "Could not load sign-in methods. Try again later.",
        });
        return;
      }
      setAccountsState({
        userId,
        providerIds: new Set((data ?? []).map((account) => account.providerId)),
        error: "",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const accountsLoadedForUser = user?.id && accountsState.userId === user.id;
  const providerIds = accountsLoadedForUser ? accountsState.providerIds : null;
  const accountsError = accountsLoadedForUser ? accountsState.error : "";

  if (sessionPending) {
    return (
      <div
        className="bg-muted h-24 w-full rounded-lg"
        aria-hidden
        data-testid="account-summary-loading"
      />
    );
  }

  if (!user) {
    return (
      <p className="text-body-sm text-muted-foreground">
        Session unavailable. Try refreshing the page.
      </p>
    );
  }

  const hasCredential = providerIds?.has("credential");

  return (
    <div className="flex flex-col gap-3">
      <AuthMessage>{accountsError}</AuthMessage>
      <dl className="border-border divide-border divide-y rounded-lg border text-sm">
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="text-foreground font-medium break-all">
            {user.email}
          </dd>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Sign-in</dt>
          <dd className="text-foreground">
            {providerIds === null
              ? "Loading…"
              : formatAuthProviders(providerIds)}
          </dd>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Email status</dt>
          <dd className="text-foreground">
            {user.emailVerified ? (
              "Verified"
            ) : (
              <span>
                Not verified —{" "}
                <Link href="/verify-email" className="text-primary underline">
                  verify your email
                </Link>
              </span>
            )}
          </dd>
        </div>
      </dl>
      {hasCredential ? (
        <p className="text-body-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary underline">
            Reset password
          </Link>{" "}
          if you need a new one.
        </p>
      ) : null}
    </div>
  );
}
