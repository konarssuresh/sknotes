import { describe, expect, it } from "vitest";

import { isRecoverableLoadError } from "@/lib/pwa/chunk-load-recovery";

describe("isRecoverableLoadError", () => {
  it("detects chunk load failures", () => {
    expect(isRecoverableLoadError("Loading chunk 123 failed")).toBe(true);
    expect(isRecoverableLoadError("ChunkLoadError: foo")).toBe(true);
  });

  it("detects React connection closed", () => {
    expect(isRecoverableLoadError("Minified React error #412")).toBe(true);
    expect(isRecoverableLoadError("Connection closed")).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isRecoverableLoadError("NetworkError")).toBe(false);
    expect(isRecoverableLoadError(undefined)).toBe(false);
  });
});
