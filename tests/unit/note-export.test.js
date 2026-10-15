import { describe, expect, it } from "vitest";

import {
  noteToMarkdownExport,
  noteToPlainTextExport,
} from "@/lib/domain/notes/export";

describe("note export", () => {
  const sample = {
    title: "My Note",
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Body line" }],
          },
        ],
      },
    },
  };

  it("exports plain text with title", () => {
    expect(noteToPlainTextExport(sample)).toBe("My Note\n\nBody line");
  });

  it("exports markdown with heading", () => {
    expect(noteToMarkdownExport(sample)).toContain("# My Note");
    expect(noteToMarkdownExport(sample)).toContain("Body line");
  });
});
