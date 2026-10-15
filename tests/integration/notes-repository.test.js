import { ObjectId } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createEmptyLexicalContent } from "@/lib/domain/notes/defaults";
import {
  insertNote,
  updateNoteForUser,
  findNoteForUser,
} from "@/lib/repositories/notes-repository";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

describe("notes repository", () => {
  beforeAll(async () => {
    await startMemoryMongo();
  });

  afterAll(async () => {
    await stopMemoryMongo();
  });

  it("updates atomically with expected revision", async () => {
    const inserted = await insertNote("user-a", {
      title: "One",
      content: createEmptyLexicalContent(),
      contentVersion: 1,
      plainText: "",
      tagIds: [],
      pinned: false,
      status: "active",
      revision: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const id = inserted._id.toString();

    const ok = await updateNoteForUser({
      userId: "user-a",
      noteId: id,
      expectedRevision: 1,
      update: { title: "Two", plainText: "" },
    });
    expect(ok.ok).toBe(true);
    expect(ok.note?.revision).toBe(2);
    expect(ok.note?.title).toBe("Two");
  });

  it("returns stale when revision mismatches", async () => {
    const inserted = await insertNote("user-b", {
      title: "X",
      content: createEmptyLexicalContent(),
      contentVersion: 1,
      plainText: "",
      tagIds: [],
      pinned: false,
      status: "active",
      revision: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const id = inserted._id.toString();

    const stale = await updateNoteForUser({
      userId: "user-b",
      noteId: id,
      expectedRevision: 1,
      update: { title: "Y", plainText: "" },
    });
    expect(stale.ok).toBe(true);

    const conflict = await updateNoteForUser({
      userId: "user-b",
      noteId: id,
      expectedRevision: 1,
      update: { title: "Z", plainText: "" },
    });
    expect(conflict.ok).toBe(false);
    expect(conflict.reason).toBe("stale");
    expect(conflict.note?.revision).toBe(2);
  });

  it("hides foreign ownership as missing", async () => {
    const noteId = new ObjectId();
    const inserted = await insertNote("user-owner", {
      _id: noteId,
      title: "Private",
      content: createEmptyLexicalContent(),
      contentVersion: 1,
      plainText: "",
      tagIds: [],
      pinned: false,
      status: "active",
      revision: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const foreign = await findNoteForUser(
      "user-other",
      inserted._id.toString()
    );
    expect(foreign).toBeNull();
  });
});
