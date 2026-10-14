"use client";

import { useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { GoogleLogo } from "@/components/auth/google-logo";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function GoogleSignInButton({ label = "Sign in with Google" }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <AuthMessage>{error}</AuthMessage>
      <Button
        type="button"
        variant="outline"
        className="text-body-sm h-11 w-full gap-3 font-medium"
        disabled={pending}
        onClick={async () => {
          setError("");
          setPending(true);
          const { error: signInError } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
          });
          setPending(false);
          if (signInError) {
            setError(
              signInError.message ||
                "Google sign-in is unavailable. Check server Google OAuth configuration."
            );
          }
        }}
      >
        {pending ? (
          "Redirecting…"
        ) : (
          <>
            <GoogleLogo size={20} className="shrink-0" />
            <span>{label}</span>
          </>
        )}
      </Button>
    </div>
  );
}
