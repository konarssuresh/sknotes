import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { resetAuthForTests } from "@/lib/auth/auth";
import { deleteApplicationDataForUser } from "@/lib/application/delete-account";
import { NOTES_COLLECTION, TAGS_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";
import {
  startMemoryMongo,
  stopMemoryMongo,
} from "@/tests/helpers/mongo-memory";

describe("account deletion data cleanup", () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetAuthForTests();
  });

  afterAll(async () => {
    resetAuthForTests();
    await stopMemoryMongo();
  });

  it("deletes only the target user notes and tags", async () => {
    const db = await getDb();
    await db.collection(NOTES_COLLECTION).insertMany([
      {
        userId: "user-a",
        title: "A1",
        status: "active",
        updatedAt: new Date(),
      },
      {
        userId: "user-b",
        title: "B1",
        status: "active",
        updatedAt: new Date(),
      },
    ]);
    await db.collection(TAGS_COLLECTION).insertMany([
      {
        userId: "user-a",
        name: "Work",
        normalizedName: "work",
        updatedAt: new Date(),
      },
      {
        userId: "user-b",
        name: "Home",
        normalizedName: "home",
        updatedAt: new Date(),
      },
    ]);

    await deleteApplicationDataForUser("user-a");

    const aNotes = await db
      .collection(NOTES_COLLECTION)
      .countDocuments({ userId: "user-a" });
    const bNotes = await db
      .collection(NOTES_COLLECTION)
      .countDocuments({ userId: "user-b" });
    const aTags = await db
      .collection(TAGS_COLLECTION)
      .countDocuments({ userId: "user-a" });
    const bTags = await db
      .collection(TAGS_COLLECTION)
      .countDocuments({ userId: "user-b" });

    expect(aNotes).toBe(0);
    expect(bNotes).toBe(1);
    expect(aTags).toBe(0);
    expect(bTags).toBe(1);
  });
});
