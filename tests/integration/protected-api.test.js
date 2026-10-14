import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { resetAuthForTests } from "@/lib/auth/auth";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

describe("protected account API", () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetAuthForTests();
  });

  afterAll(async () => {
    resetAuthForTests();
    await stopMemoryMongo();
  });

  it("rejects unauthenticated DELETE", async () => {
    const { DELETE } = await import("@/app/api/account/route");
    const request = new Request("http://localhost/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmPhrase: "DELETE" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error.code).toBe("UNAUTHORIZED");
    expect(payload.error.requestId).toBeTruthy();
  });
});
