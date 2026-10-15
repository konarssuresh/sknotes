import { describe, expect, it } from "vitest";

import { assertNoteContentEditable } from "@/lib/domain/notes/lifecycle";
import { ApiError } from "@/lib/errors/api-error";

describe("assertNoteContentEditable", () => {
  it("allows active and archived", () => {
    expect(() => assertNoteContentEditable("active")).not.toThrow();
    expect(() => assertNoteContentEditable("archived")).not.toThrow();
  });

  it("blocks trashed", () => {
    expect(() => assertNoteContentEditable("trashed")).toThrow(ApiError);
  });
});
