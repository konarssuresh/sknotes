import { afterEach, describe, expect, it, vi } from "vitest";

import { EmailDeliveryError } from "@/lib/email/email-delivery-error";
import {
  sendTransactionalEmail,
  setEmailSenderForTests,
} from "@/lib/email/send-transactional-email";

describe("sendTransactionalEmail", () => {
  afterEach(() => {
    setEmailSenderForTests(null);
    vi.unstubAllEnvs();
  });

  it("uses injected test sender", async () => {
    const sender = vi.fn().mockResolvedValue(undefined);
    setEmailSenderForTests(sender);

    await sendTransactionalEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hi</p>",
      text: "Hi",
    });

    expect(sender).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hi</p>",
      text: "Hi",
    });
  });

  it("throws a safe error in production when not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    await expect(
      sendTransactionalEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hi</p>",
        text: "Hi",
      })
    ).rejects.toBeInstanceOf(EmailDeliveryError);
  });
});
