import { describe, expect, it } from "vitest";

import { normalizeTagName } from "@/lib/domain/normalize-tag-name";

describe("normalizeTagName", () => {
  it("trims and lowercases tag names", () => {
    expect(normalizeTagName("  Work  ")).toBe("work");
    expect(normalizeTagName("Ideas")).toBe("ideas");
  });
});
