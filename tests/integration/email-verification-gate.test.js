// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { resetAuthForTests } from "@/lib/auth/auth";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

describe("email verification API gate", () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetAuthForTests();
  });

  afterAll(async () => {
    resetAuthForTests();
    await stopMemoryMongo();
  });

  it("rejects unverified users on protected account API", async () => {
    const { auth } = await import("@/lib/auth/auth");
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      session: { id: "session-1", userId: "user-1" },
      user: {
        id: "user-1",
        email: "unverified@example.com",
        emailVerified: false,
      },
    });

    const { DELETE } = await import("@/app/api/account/route");
    const request = new Request("http://localhost/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmPhrase: "DELETE" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe("FORBIDDEN");
    expect(payload.error.details?.reason).toBe("EMAIL_NOT_VERIFIED");

    vi.restoreAllMocks();
  });
});
