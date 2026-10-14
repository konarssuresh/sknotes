import { describe, expect, it } from "vitest";

import { noteDocumentSchema } from "@/lib/validation/note-document";
import { tagDocumentSchema } from "@/lib/validation/tag-document";

describe("noteDocumentSchema", () => {
  it("accepts a valid note document", () => {
    const parsed = noteDocumentSchema.parse({
      userId: "user-1",
      title: "Hello",
      content: { root: {} },
      contentVersion: 1,
      plainText: "Hello",
      tagIds: [],
      pinned: false,
      status: "active",
      revision: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(parsed.status).toBe("active");
  });
});

describe("tagDocumentSchema", () => {
  it("requires normalizedName", () => {
    const parsed = tagDocumentSchema.parse({
      userId: "user-1",
      name: "Work",
      normalizedName: "work",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(parsed.normalizedName).toBe("work");
  });
});
