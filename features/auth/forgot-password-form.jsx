"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { AuthMessage } from "@/components/auth/auth-message";
import { RhfField } from "@/components/forms/rhf-field";
import { PasswordField } from "@/components/forms/fields/password-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth-schemas";

export function ForgotPasswordForm({ resetToken }) {
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const requestMethods = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const resetMethods = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: resetToken || "", password: "" },
    mode: "onSubmit",
  });

  const onRequest = requestMethods.handleSubmit(async (values) => {
    setFormError("");
    setSuccess("");
    setPending(true);
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/forgot-password`,
    });
    setPending(false);

    if (error) {
      if (error.status === 429) {
        setFormError(
          "Too many requests. Please wait a few minutes and try again."
        );
        return;
      }
      setFormError(
        error.message || "Unable to send reset email. Please try again later."
      );
      return;
    }

    setSuccess(
      "If an account exists for that email, a reset link has been sent."
    );
    requestMethods.reset();
  });

  const onReset = resetMethods.handleSubmit(async (values) => {
    setFormError("");
    setSuccess("");
    setPending(true);
    const { error } = await authClient.resetPassword({
      token: values.token,
      newPassword: values.password,
    });
    setPending(false);

    if (error) {
      const message = error.message || "";
      if (/expired|invalid|used/i.test(message)) {
        setFormError(
          "This reset link is invalid or has expired. Request a new link below."
        );
        return;
      }
      if (error.status === 429) {
        setFormError(
          "Too many attempts. Please wait a few minutes and try again."
        );
        return;
      }
      setFormError(error.message || "Unable to reset password.");
      return;
    }

    setSuccess("Password updated. You can sign in with your new password.");
    resetMethods.reset({ token: values.token, password: "" });
  });

  if (resetToken) {
    return (
      <FormProvider {...resetMethods}>
        <AuthMessage>{formError}</AuthMessage>
        <AuthMessage variant="success">{success}</AuthMessage>
        <form className="flex flex-col gap-4" noValidate onSubmit={onReset}>
          <RhfField
            name="password"
            label="New password"
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
            {pending ? "Saving…" : "Set new password"}
          </Button>
        </form>
        <p className="text-body-sm text-muted-foreground mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-primary underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
          {" · "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...requestMethods}>
      <AuthMessage>{formError}</AuthMessage>
      <AuthMessage variant="success">{success}</AuthMessage>
      <form className="flex flex-col gap-4" noValidate onSubmit={onRequest}>
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
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="text-body-sm text-muted-foreground mt-6 text-center">
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </FormProvider>
  );
}
