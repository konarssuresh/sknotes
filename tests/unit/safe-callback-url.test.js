import { describe, expect, it } from "vitest";

import { toSafeCallbackPath } from "@/lib/auth/safe-callback-url";

describe("toSafeCallbackPath", () => {
  it("allows relative paths", () => {
    expect(toSafeCallbackPath("/verify-email")).toBe("/verify-email");
    expect(toSafeCallbackPath("/notes?q=1")).toBe("/notes?q=1");
  });

  it("rejects external and unsafe URLs", () => {
    expect(toSafeCallbackPath("https://evil.example")).toBe("/");
    expect(toSafeCallbackPath("//evil.example")).toBe("/");
    expect(toSafeCallbackPath("javascript:alert(1)")).toBe("/");
  });
});
