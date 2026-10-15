import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createNote } from "@/lib/application/notes/create-note";
import { getNote } from "@/lib/application/notes/get-note";
import { updateNote } from "@/lib/application/notes/update-note";
import { createEmptyLexicalContent } from "@/lib/domain/notes/defaults";
import { ApiError } from "@/lib/errors/api-error";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

function contentWithText(text) {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text }],
        },
      ],
    },
  };
}

describe("notes use cases", () => {
  beforeAll(async () => {
    await startMemoryMongo();
  });

  afterAll(async () => {
    await stopMemoryMongo();
  });

  it("creates and reads owned notes", async () => {
    const created = await createNote("user-1", {
      title: "Hi",
      content: contentWithText("Body"),
    });
    const loaded = await getNote("user-1", created.id);
    expect(loaded.title).toBe("Hi");
    expect(loaded.plainText).toBe("Body");
  });

  it("rejects empty create without forceCreate", async () => {
    await expect(
      createNote("user-1", {
        title: "",
        content: createEmptyLexicalContent(),
      })
    ).rejects.toThrow(ApiError);
  });

  it("maps stale revision to conflict", async () => {
    const created = await createNote("user-2", {
      title: "A",
      content: contentWithText("one"),
    });
    await updateNote("user-2", created.id, {
      expectedRevision: created.revision,
      title: "B",
    });

    await expect(
      updateNote("user-2", created.id, {
        expectedRevision: created.revision,
        title: "C",
      })
    ).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
    });
  });

  it("blocks edits to trashed notes", async () => {
    const created = await createNote("user-3", {
      title: "Trash me",
      content: contentWithText("x"),
    });
    const { updateNoteForUser } =
      await import("@/lib/repositories/notes-repository");
    await updateNoteForUser({
      userId: "user-3",
      noteId: created.id,
      expectedRevision: created.revision,
      update: { status: "trashed" },
    });

    const trashed = await getNote("user-3", created.id);
    await expect(
      updateNote("user-3", created.id, {
        expectedRevision: trashed.revision,
        title: "Nope",
      })
    ).rejects.toMatchObject({ status: 403 });
  });
});
