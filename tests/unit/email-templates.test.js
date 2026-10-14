import { describe, expect, it } from "vitest";

import { buildResetPasswordEmail } from "@/lib/email/templates/reset-password-email";
import { buildVerificationEmail } from "@/lib/email/templates/verification-email";

describe("email templates", () => {
  it("builds verification email with SKNotes branding and action URL", () => {
    const url = "https://app.example.com/api/auth/verify-email?token=abc";
    const { subject, html, text } = buildVerificationEmail({
      actionUrl: url,
      userName: "Ada",
    });

    expect(subject).toBe("Verify your SKNotes email");
    expect(text).toContain("Ada");
    expect(text).toContain(url);
    expect(html).toContain("SKNotes");
    expect(html).toContain("Verify your email");
    expect(html).toContain(url.replace(/&/g, "&amp;"));
  });

  it("builds password reset email with SKNotes branding and action URL", () => {
    const url = "https://app.example.com/forgot-password?token=xyz";
    const { subject, html, text } = buildResetPasswordEmail({
      actionUrl: url,
      userName: null,
    });

    expect(subject).toBe("Reset your SKNotes password");
    expect(text).toContain("Hi there");
    expect(text).toContain(url);
    expect(html).toContain("Reset your password");
    expect(html).toContain(url);
  });
});
