import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createNote } from "@/lib/application/notes/create-note";
import { deleteNotePermanently } from "@/lib/application/notes/delete-note";
import { getNote } from "@/lib/application/notes/get-note";
import { updateNote } from "@/lib/application/notes/update-note";
import { ApiError } from "@/lib/errors/api-error";
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

describe("lifecycle and permanent delete", () => {
  beforeAll(async () => {
    await startMemoryMongo();
  });

  afterAll(async () => {
    await stopMemoryMongo();
  });

  it("restores trashed notes to active and blocks delete until trashed", async () => {
    const created = await createNote("life-user", {
      title: "X",
      content: contentWithText("y"),
    });
    const archived = await updateNote("life-user", created.id, {
      expectedRevision: created.revision,
      status: "archived",
    });
    const trashed = await updateNote("life-user", created.id, {
      expectedRevision: archived.revision,
      status: "trashed",
    });

    await expect(
      deleteNotePermanently("life-user", created.id)
    ).resolves.toBeUndefined();

    await expect(getNote("life-user", created.id)).rejects.toMatchObject({
      status: 404,
    });

    const other = await createNote("life-user", {
      title: "Keep",
      content: contentWithText("z"),
    });
    await expect(
      deleteNotePermanently("life-user", other.id)
    ).rejects.toMatchObject({ status: 403 });
  });

  it("isolates ownership on updates", async () => {
    const created = await createNote("owner-a", {
      title: "Secret",
      content: contentWithText("1"),
    });
    await expect(
      updateNote("owner-b", created.id, {
        expectedRevision: created.revision,
        status: "archived",
      })
    ).rejects.toMatchObject({ status: 404 });
  });
});
