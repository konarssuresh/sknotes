import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createNote } from "@/lib/application/notes/create-note";
import { updateNote } from "@/lib/application/notes/update-note";
import { createTag } from "@/lib/application/tags/create-tag";
import { deleteTag } from "@/lib/application/tags/delete-tag";
import { listTags } from "@/lib/application/tags/list-tags";
import { renameTag } from "@/lib/application/tags/rename-tag";
import { ApiError } from "@/lib/errors/api-error";
import { findNoteForUser } from "@/lib/repositories/notes-repository";
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

describe("tags use cases", () => {
  beforeAll(async () => {
    await startMemoryMongo();
  });

  afterAll(async () => {
    await stopMemoryMongo();
  });

  it("normalizes names and prevents duplicates per user", async () => {
    await createTag("user-a", { name: "Work" });
    await expect(
      createTag("user-a", { name: "  work " })
    ).rejects.toMatchObject({
      status: 409,
    });
    await createTag("user-b", { name: "Work" });
    const tags = await listTags("user-a");
    expect(tags).toHaveLength(1);
  });

  it("keeps stable ids across rename and updates note tag references", async () => {
    const tag = await createTag("user-c", { name: "Ideas" });
    const note = await createNote("user-c", {
      title: "N",
      content: contentWithText("x"),
    });
    const tagged = await updateNote("user-c", note.id, {
      expectedRevision: note.revision,
      tagIds: [tag.id],
    });
    expect(tagged.tagIds).toEqual([tag.id]);

    const renamed = await renameTag("user-c", tag.id, { name: "Inspiration" });
    expect(renamed.id).toBe(tag.id);
    expect(renamed.name).toBe("Inspiration");

    const reloaded = await findNoteForUser("user-c", note.id);
    expect(reloaded?.tagIds).toEqual([tag.id]);
  });

  it("removes tag from notes on delete", async () => {
    const tag = await createTag("user-d", { name: "Temp" });
    const note = await createNote("user-d", {
      title: "T",
      content: contentWithText("y"),
    });
    await updateNote("user-d", note.id, {
      expectedRevision: note.revision,
      tagIds: [tag.id],
    });
    await deleteTag("user-d", tag.id);
    const reloaded = await findNoteForUser("user-d", note.id);
    expect(reloaded?.tagIds).toEqual([]);
  });
});
