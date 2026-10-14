import { ObjectId } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { assertResourceOwnership } from "@/lib/auth/assert-ownership";
import { ApiError } from "@/lib/errors/api-error";
import { findNoteForUser } from "@/lib/repositories/notes-repository";
import { NOTES_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

describe("ownership", () => {
  beforeAll(async () => {
    await startMemoryMongo();
  });

  afterAll(async () => {
    await stopMemoryMongo();
  });

  it("assertResourceOwnership hides foreign resources", () => {
    expect(() => assertResourceOwnership({ userId: "a" }, "b")).toThrow(
      ApiError
    );
  });

  it("findNoteForUser scopes by userId", async () => {
    const db = await getDb();
    const noteId = new ObjectId();
    await db.collection(NOTES_COLLECTION).insertOne({
      _id: noteId,
      userId: "user-a",
      title: "Secret",
      status: "active",
      updatedAt: new Date(),
    });

    const owned = await findNoteForUser("user-a", noteId.toString());
    const foreign = await findNoteForUser("user-b", noteId.toString());

    expect(owned?.title).toBe("Secret");
    expect(foreign).toBeNull();
  });
});
