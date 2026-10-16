import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createNote } from "@/lib/application/notes/create-note";
import { listNotes } from "@/lib/application/notes/list-notes";
import { searchNotes } from "@/lib/application/notes/search-notes";
import { createTag } from "@/lib/application/tags/create-tag";
import { updateNote } from "@/lib/application/notes/update-note";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

function contentWithText(text) {
  return {
    root: {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", text }] }],
    },
  };
}

describe("search and pagination", () => {
  beforeAll(async () => {
    await startMemoryMongo();
  });

  afterAll(async () => {
    await stopMemoryMongo();
  });

  it("paginates in updatedAt desc order without duplicates", async () => {
    const userId = "pager-user";
    for (let i = 0; i < 35; i++) {
      await createNote(userId, {
        title: `Note ${i}`,
        content: contentWithText(`body ${i}`),
      });
      await new Promise((resolve) => setTimeout(resolve, 2));
    }

    const first = await listNotes(userId, { status: "active", limit: 30 });
    expect(first.notes).toHaveLength(30);
    expect(first.nextCursor).toBeTruthy();

    const second = await listNotes(userId, {
      status: "active",
      limit: 30,
      cursor: first.nextCursor,
    });
    expect(second.notes.length).toBeGreaterThan(0);
    const firstIds = new Set(first.notes.map((note) => note.id));
    for (const note of second.notes) {
      expect(firstIds.has(note.id)).toBe(false);
    }
  });

  it("searches title, plain text, and tag names within user scope", async () => {
    const userId = "search-user";
    const tag = await createTag(userId, { name: "AlphaTag" });
    const note = await createNote(userId, {
      title: "Meeting",
      content: contentWithText("quarterly planning"),
    });
    await updateNote(userId, note.id, {
      expectedRevision: note.revision,
      tagIds: [tag.id],
    });

    const byTitle = await searchNotes(userId, {
      q: "meet",
      status: "active",
      limit: 30,
    });
    expect(byTitle.notes.some((n) => n.id === note.id)).toBe(true);

    const byBody = await searchNotes(userId, {
      q: "quarterly",
      status: "active",
      limit: 30,
    });
    expect(byBody.notes.some((n) => n.id === note.id)).toBe(true);

    const byTag = await searchNotes(userId, {
      q: "alphatag",
      status: "active",
      limit: 30,
    });
    expect(byTag.notes.some((n) => n.id === note.id)).toBe(true);

    const other = await searchNotes("other-user", {
      q: "meet",
      status: "active",
      limit: 30,
    });
    expect(other.notes).toHaveLength(0);
  });
});
