// @vitest-environment node

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { resetAuthForTests } from "@/lib/auth/auth";
import { setEmailSenderForTests } from "@/lib/email/send-transactional-email";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

describe("auth email callbacks", () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetAuthForTests();
  });

  afterEach(() => {
    setEmailSenderForTests(null);
    resetAuthForTests();
  });

  afterAll(async () => {
    resetAuthForTests();
    await stopMemoryMongo();
  });

  it("sends branded verification email on sign-up", async () => {
    const sent = [];
    setEmailSenderForTests(async (message) => {
      sent.push(message);
    });

    const { getAuth } = await import("@/lib/auth/auth");
    const auth = getAuth();

    await auth.api.signUpEmail({
      body: {
        email: "verify-me@example.com",
        password: "password12345",
        name: "Test User",
      },
    });

    expect(sent.length).toBeGreaterThanOrEqual(1);
    const verification = sent.find((m) =>
      m.subject.includes("Verify your SKNotes email")
    );
    expect(verification).toBeTruthy();
    expect(verification.html).toContain("SKNotes");
    expect(verification.text).toContain("SKNotes");
  });

  it("skips verification email when user is already verified", async () => {
    const sent = [];
    setEmailSenderForTests(async (message) => {
      sent.push(message);
    });

    const { sendVerificationAuthEmail } =
      await import("@/lib/email/send-auth-email");

    await sendVerificationAuthEmail({
      user: {
        email: "verified@example.com",
        name: "Verified",
        emailVerified: true,
      },
      url: "http://localhost:3000/verify",
    });

    expect(sent).toHaveLength(0);
  });

  it("sends branded password reset email from callback helper", async () => {
    const sent = [];
    setEmailSenderForTests(async (message) => {
      sent.push(message);
    });

    const { sendPasswordResetAuthEmail } =
      await import("@/lib/email/send-auth-email");

    await sendPasswordResetAuthEmail({
      user: { email: "reset@example.com", name: "Reset" },
      url: "http://localhost:3000/forgot-password?token=safe",
    });

    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toBe("Reset your SKNotes password");
    expect(sent[0].html).toContain("Reset your password");
  });
});
