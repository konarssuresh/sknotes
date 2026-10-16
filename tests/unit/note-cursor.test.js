import { describe, expect, it } from "vitest";

import { decodeNoteCursor, encodeNoteCursor } from "@/lib/notes/cursor";

describe("note cursor", () => {
  it("round-trips updatedAt and id", () => {
    const updatedAt = new Date("2026-01-15T12:00:00.000Z");
    const id = "507f1f77bcf86cd799439011";
    const encoded = encodeNoteCursor({ updatedAt, id });
    const decoded = decodeNoteCursor(encoded);
    expect(decoded.id).toBe(id);
    expect(decoded.updatedAt.toISOString()).toBe(updatedAt.toISOString());
  });
});
