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
import { signUpSchema } from "@/lib/validation/auth-schemas";

export function SignUpForm() {
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const methods = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    setFormError("");
    setSuccess("");
    setPending(true);
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/verify-email",
    });
    setPending(false);

    if (error) {
      setFormError(error.message || "Unable to create your account.");
      return;
    }

    setSuccess(
      "Account created. Check your email for a verification link before signing in."
    );
    methods.reset();
  });

  return (
    <FormProvider {...methods}>
      <AuthMessage>{formError}</AuthMessage>
      <AuthMessage variant="success">{success}</AuthMessage>
      <GoogleSignInButton label="Sign up with Google" />
      <div className="my-6 flex items-center gap-3" role="separator">
        <div className="bg-border h-px flex-1" />
        <span className="text-caption text-muted-foreground">
          or continue with email
        </span>
        <div className="bg-border h-px flex-1" />
      </div>
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <RhfField
          name="name"
          label="Name"
          required
          render={({ field, id, describedBy, invalid, required }) => (
            <TextField
              id={id}
              autoComplete="name"
              describedBy={describedBy}
              invalid={invalid}
              required={required}
              {...field}
            />
          )}
        />
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
          hint="At least 8 characters."
          required
          render={({ field, id, describedBy, invalid, required }) => (
            <PasswordField
              id={id}
              autoComplete="new-password"
              describedBy={describedBy}
              invalid={invalid}
              required={required}
              {...field}
            />
          )}
        />
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-body-sm text-muted-foreground mt-6 text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </FormProvider>
  );
}
