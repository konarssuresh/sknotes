import { describe, expect, it } from "vitest";

import { createEmptyLexicalContent } from "@/lib/domain/notes/defaults";
import { plainTextFromLexical } from "@/lib/domain/notes/plain-text";

describe("plainTextFromLexical", () => {
  it("returns empty for empty editor", () => {
    expect(plainTextFromLexical(createEmptyLexicalContent())).toBe("");
  });

  it("extracts paragraph text", () => {
    const content = {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Hello world" }],
          },
        ],
      },
    };
    expect(plainTextFromLexical(content)).toBe("Hello world");
  });
});
