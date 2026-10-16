import { describe, expect, it } from "vitest";

import { assertValidStatusTransition } from "@/lib/domain/notes/status-transitions";
import { ApiError } from "@/lib/errors/api-error";

describe("status transitions", () => {
  it("allows archive and trash from active", () => {
    expect(() =>
      assertValidStatusTransition("active", "archived")
    ).not.toThrow();
    expect(() =>
      assertValidStatusTransition("active", "trashed")
    ).not.toThrow();
  });

  it("allows restore from trash to active", () => {
    expect(() =>
      assertValidStatusTransition("trashed", "active")
    ).not.toThrow();
  });

  it("rejects illegal transitions", () => {
    expect(() => assertValidStatusTransition("trashed", "archived")).toThrow(
      ApiError
    );
  });
});
