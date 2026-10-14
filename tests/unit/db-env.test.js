import { afterEach, describe, expect, it } from "vitest";

import { getMongoUri, validateMongoUri } from "@/lib/db/env";

describe("db env", () => {
  const originalUri = process.env.MONGODB_URI;

  afterEach(() => {
    process.env.MONGODB_URI = originalUri;
  });

  it("validates mongodb uri prefix", () => {
    expect(() => validateMongoUri("postgres://x")).toThrow(/mongodb/);
    validateMongoUri("mongodb://localhost:27017/test");
    validateMongoUri("mongodb+srv://cluster.example.net/test");
  });

  it("throws when MONGODB_URI is missing", () => {
    delete process.env.MONGODB_URI;
    expect(() => getMongoUri()).toThrow(/MONGODB_URI/);
  });
});
