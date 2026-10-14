import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SampleProfileForm } from "@/components/forms/examples/sample-profile-form";

describe("SampleProfileForm", () => {
  it("shows Zod validation messages on submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SampleProfileForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Display name is required")).toBeInTheDocument();
      expect(
        screen.getByText("Enter a valid email address")
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits when values are valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SampleProfileForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/display name/i), "Ada");
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { displayName: "Ada", email: "ada@example.com" },
        expect.anything()
      );
    });
  });
});
