import { describe, expect, it } from "vitest";

import { clientErrorReportSchema } from "@/lib/validation/client-error-schema";

describe("clientErrorReportSchema", () => {
  it("accepts minimal scrubbed payloads", () => {
    const parsed = clientErrorReportSchema.parse({
      message: "Hydration failed",
      route: "/notes",
      lastApiRequestId: "abc-123",
    });
    expect(parsed.message).toBe("Hydration failed");
  });

  it("rejects oversized messages", () => {
    expect(() =>
      clientErrorReportSchema.parse({ message: "x".repeat(501) })
    ).toThrow();
  });
});
