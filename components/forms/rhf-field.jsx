"use client";

import { Controller, useFormContext } from "react-hook-form";

import {
  FieldLayout,
  getFieldDescribedBy,
} from "@/components/forms/fields/field-layout";

/**
 * Connects a React Hook Form field to an accessible building block via render.
 */
export function RhfField({
  name,
  control,
  label,
  hint,
  required,
  disabled,
  className,
  rules,
  render,
}) {
  const context = useFormContext();
  const resolvedControl = control ?? context?.control;

  if (!resolvedControl) {
    throw new Error("RhfField requires a control prop or FormProvider");
  }

  return (
    <Controller
      name={name}
      control={resolvedControl}
      disabled={disabled}
      rules={rules}
      render={({ field, fieldState }) => {
        const fieldId = field.name;
        const errorMessage = fieldState.error?.message;
        const { describedBy } = getFieldDescribedBy({
          id: fieldId,
          hint,
          error: errorMessage,
        });

        return (
          <FieldLayout
            id={fieldId}
            label={label}
            hint={hint}
            error={errorMessage}
            required={required}
            className={className}
          >
            {render({
              field,
              fieldState,
              id: fieldId,
              describedBy,
              invalid: Boolean(fieldState.error),
              required: Boolean(required),
            })}
          </FieldLayout>
        );
      }}
    />
  );
}
