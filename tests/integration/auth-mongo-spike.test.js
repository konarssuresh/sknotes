import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { resetAuthForTests } from "@/lib/auth/auth";
import { connectMongo, getDb } from "@/lib/db/client";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

describe("auth mongo spike", () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetAuthForTests();
  });

  afterAll(async () => {
    resetAuthForTests();
    await stopMemoryMongo();
  });

  it("connects to MongoDB and loads Better Auth", async () => {
    await connectMongo();
    const db = await getDb();
    const ping = await db.command({ ping: 1 });
    expect(ping.ok).toBe(1);

    const { getAuth } = await import("@/lib/auth/auth");
    const auth = getAuth();
    expect(auth).toBeTruthy();
    expect(auth.api).toBeTruthy();
  });
});
