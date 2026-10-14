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
import { resendVerificationSchema } from "@/lib/validation/auth-schemas";

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [statusMessage, setStatusMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const methods = useForm({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    void authClient.verifyEmail({ query: { token } }).then(({ error }) => {
      if (cancelled) {
        return;
      }
      if (error) {
        setFormError(
          error.message || "Verification link is invalid or expired."
        );
        return;
      }
      setStatusMessage("Email verified. Redirecting you to the app…");
      router.replace("/");
      router.refresh();
    });

    return () => {
      cancelled = true;
    };
  }, [token, router]);

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
      setFormError(error.message || "Unable to resend verification email.");
      return;
    }

    setStatusMessage(
      "If an account exists, a verification email has been sent."
    );
    methods.reset();
  });

  return (
    <div className="flex flex-col gap-4">
      <AuthMessage>{formError}</AuthMessage>
      <AuthMessage variant="success">{statusMessage}</AuthMessage>
      {!token ? (
        <>
          <p className="text-body-sm text-muted-foreground">
            We sent a verification link to your email. You can request another
            message below.
          </p>
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
