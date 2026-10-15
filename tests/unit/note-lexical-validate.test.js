import { describe, expect, it } from "vitest";

import { createEmptyLexicalContent } from "@/lib/domain/notes/defaults";
import { validateLexicalContent } from "@/lib/domain/notes/lexical-validate";
import { ApiError } from "@/lib/errors/api-error";

describe("validateLexicalContent", () => {
  it("accepts empty root content", () => {
    const parsed = validateLexicalContent(createEmptyLexicalContent());
    expect(parsed.root.type).toBe("root");
  });

  it("rejects javascript links", () => {
    expect(() =>
      validateLexicalContent({
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "link",
                  url: "javascript:alert(1)",
                  children: [{ type: "text", text: "bad" }],
                },
              ],
            },
          ],
        },
      })
    ).toThrow(ApiError);
  });
});
