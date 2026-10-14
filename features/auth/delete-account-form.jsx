"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { AuthMessage } from "@/components/auth/auth-message";
import { RhfField } from "@/components/forms/rhf-field";
import { PasswordField } from "@/components/forms/fields/password-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { deleteAccountSchema } from "@/lib/validation/auth-schemas";

export function DeleteAccountForm() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const methods = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmPhrase: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    setFormError("");
    setPending(true);

    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmPhrase: values.confirmPhrase,
        password: values.password || undefined,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setFormError(
        payload?.error?.message ||
          "Unable to delete your account. Try signing in again and retry."
      );
      setPending(false);
      return;
    }

    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  });

  return (
    <FormProvider {...methods}>
      <AuthMessage>{formError}</AuthMessage>
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <p className="text-body-sm text-muted-foreground">
          This permanently deletes your notes, tags, and account. Type{" "}
          <strong className="text-foreground font-medium">DELETE</strong> to
          confirm. Password users must enter their current password.
        </p>
        <RhfField
          name="confirmPhrase"
          label="Confirmation"
          required
          render={({ field, id, describedBy, invalid, required }) => (
            <TextField
              id={id}
              autoComplete="off"
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
          hint="Required if you sign in with email and password."
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
        <Button
          type="submit"
          variant="destructive"
          className="h-11 w-full"
          disabled={pending}
        >
          {pending ? "Deleting…" : "Delete account permanently"}
        </Button>
      </form>
    </FormProvider>
  );
}
