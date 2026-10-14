import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";

import { RhfField } from "@/components/forms/rhf-field";
import { TextField } from "@/components/forms/fields/text-field";

function TestForm({ onSubmit }) {
  const { control, handleSubmit } = useForm({
    defaultValues: { email: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RhfField
        name="email"
        control={control}
        label="Email"
        hint="We will never share your email."
        required
        rules={{ required: "Email is required" }}
        render={({ field, id, describedBy, invalid, required }) => (
          <TextField
            id={id}
            describedBy={describedBy}
            invalid={invalid}
            required={required}
            {...field}
          />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe("RhfField", () => {
  it("associates label, hint, and aria attributes", () => {
    render(<TestForm onSubmit={vi.fn()} />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-hint");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText(/never share/i)).toHaveAttribute(
      "id",
      "email-hint"
    );
  });

  it("shows validation error with aria-invalid and error id", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TestForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain("email-error");
  });
});
