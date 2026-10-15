"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { AuthMessage } from "@/components/auth/auth-message";
import { RhfField } from "@/components/forms/rhf-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { toSafeCallbackPath } from "@/lib/auth/safe-callback-url";
import { resendVerificationSchema } from "@/lib/validation/auth-schemas";

function mapVerificationError(error) {
  if (!error) {
    return "Verification link is invalid or expired.";
  }
  if (error.status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  const message = error.message || "";
  if (/expired/i.test(message)) {
    return "This verification link has expired. Request a new email below.";
  }
  if (/invalid|already|used/i.test(message)) {
    return "This verification link is invalid or was already used. Request a new email below.";
  }
  return message || "Verification link is invalid or expired.";
}

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const callbackURL = toSafeCallbackPath(searchParams.get("callbackURL"), "/");
  const pendingSignup = searchParams.get("pending") === "1";
  const [verifyPhase, setVerifyPhase] = useState(
    token ? "verifying" : "pending"
  );
  const [statusMessage, setStatusMessage] = useState(
    pendingSignup
      ? "Account created. Check your inbox for a verification link."
      : ""
  );
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const methods = useForm({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!token) {
      let cancelled = false;
      void authClient.getSession().then(({ data }) => {
        if (cancelled) {
          return;
        }
        if (data?.user?.emailVerified) {
          router.replace("/");
          router.refresh();
        }
      });
      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;

    void authClient
      .verifyEmail({ query: { token, callbackURL } })
      .then(({ error }) => {
        if (cancelled) {
          return;
        }
        if (error) {
          setVerifyPhase("failed");
          setFormError(mapVerificationError(error));
          return;
        }
        setVerifyPhase("success");
        setStatusMessage("Email verified. Redirecting you to the app…");
        router.replace(callbackURL);
        router.refresh();
      });

    return () => {
      cancelled = true;
    };
  }, [token, callbackURL, router]);

  const onResend = methods.handleSubmit(async (values) => {
    setFormError("");
    setStatusMessage("");
    setPending(true);
    const { error } = await authClient.sendVerificationEmail({
      email: values.email,
      callbackURL: "/",
    });
    setPending(false);

    if (error) {
      if (error.status === 429) {
        setFormError(
          "Too many requests. Please wait a few minutes before trying again."
        );
        return;
      }
      setFormError(
        error.message || "Unable to send verification email. Try again later."
      );
      return;
    }

    setStatusMessage(
      "If an account exists, a verification email has been sent."
    );
    methods.reset();
  });

  const showResendForm =
    verifyPhase !== "success" && verifyPhase !== "verifying";

  return (
    <div className="flex flex-col gap-4">
      <AuthMessage>{formError}</AuthMessage>
      <AuthMessage variant="success">{statusMessage}</AuthMessage>
      {verifyPhase === "verifying" ? (
        <p className="text-body-sm text-muted-foreground" role="status">
          Verifying your email…
        </p>
      ) : null}
      {showResendForm ? (
        <>
          {!token && verifyPhase !== "failed" ? (
            <p className="text-body-sm text-muted-foreground">
              We sent a verification link to your email. Open it to continue, or
              request another message below.
            </p>
          ) : null}
          {verifyPhase === "failed" ? (
            <p className="text-body-sm text-muted-foreground">
              Request a new verification email, or return to sign in.
            </p>
          ) : null}
          <FormProvider {...methods}>
            <form
              className="flex flex-col gap-4"
              noValidate
              onSubmit={onResend}
            >
              <RhfField
                name="email"
                label="Email"
                required
                render={({ field, id, describedBy, invalid, required }) => (
                  <TextField
                    id={id}
                    type="email"
                    autoComplete="email"
                    describedBy={describedBy}
                    invalid={invalid}
                    required={required}
                    {...field}
                  />
                )}
              />
              <Button type="submit" className="h-11 w-full" disabled={pending}>
                {pending ? "Sending…" : "Resend verification email"}
              </Button>
            </form>
          </FormProvider>
        </>
      ) : null}
      <p className="text-body-sm text-muted-foreground text-center">
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
