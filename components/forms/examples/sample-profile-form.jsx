"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { RhfField } from "@/components/forms/rhf-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { sampleProfileSchema } from "@/lib/validation/sample-profile-schema";

const defaultValues = {
  displayName: "",
  email: "",
};

export function SampleProfileForm({ onSubmit = () => {} }) {
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(sampleProfileSchema),
    mode: "onSubmit",
  });

  return (
    <FormProvider {...methods}>
      <form
        className="flex max-w-md flex-col gap-4"
        noValidate
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <RhfField
          name="displayName"
          label="Display name"
          hint="Shown on your profile in a later phase."
          required
          render={({ field, id, describedBy, invalid }) => (
            <TextField
              id={id}
              describedBy={describedBy}
              invalid={invalid}
              autoComplete="name"
              {...field}
            />
          )}
        />
        <RhfField
          name="email"
          label="Email"
          required
          render={({ field, id, describedBy, invalid }) => (
            <TextField
              id={id}
              type="email"
              describedBy={describedBy}
              invalid={invalid}
              autoComplete="email"
              {...field}
            />
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </FormProvider>
  );
}
