"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { AuthMessage } from "@/components/auth/auth-message";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { RhfField } from "@/components/forms/rhf-field";
import { PasswordField } from "@/components/forms/fields/password-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { loginSchema } from "@/lib/validation/auth-schemas";

export function LoginForm() {
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    setFormError("");
    setPending(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/",
    });
    setPending(false);

    if (error) {
      if (error.status === 403) {
        setFormError(
          "Verify your email before signing in. Check your inbox or resend verification from the verify email page."
        );
        return;
      }
      setFormError(
        error.message || "Unable to sign in. Check your credentials."
      );
    }
  });

  return (
    <FormProvider {...methods}>
      <AuthMessage>{formError}</AuthMessage>
      {formError.includes("Verify your email") ? (
        <p className="text-body-sm text-center">
          <Link
            href="/verify-email"
            className="text-primary underline underline-offset-4"
          >
            Go to verify email
          </Link>
        </p>
      ) : null}
      <GoogleSignInButton />
      <div className="my-6 flex items-center gap-3" role="separator">
        <div className="bg-border h-px flex-1" />
        <span className="text-caption text-muted-foreground">
          or continue with email
        </span>
        <div className="bg-border h-px flex-1" />
      </div>
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
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
        <RhfField
          name="password"
          label="Password"
          required
          render={({ field, id, describedBy, invalid, required }) => (
            <PasswordField
              id={id}
              autoComplete="current-password"
              describedBy={describedBy}
              invalid={invalid}
              required={required}
              {...field}
            />
          )}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-body-sm text-primary underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-body-sm text-muted-foreground mt-6 text-center">
        No account?{" "}
        <Link
          href="/sign-up"
          className="text-primary underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </FormProvider>
  );
}
