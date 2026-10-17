import { afterEach, describe, expect, it, vi } from "vitest";

import { computeSyncBackoffMs } from "@/lib/offline/sync-queue";
import {
  enqueueNoteMutation,
  flushMutationQueue,
  getPendingSyncCount,
} from "@/lib/offline/sync-queue";
import { deleteUserOfflineDatabase } from "@/lib/offline/db";

const createNoteRequest = vi.fn();
const updateNoteRequest = vi.fn();

vi.mock("@/features/notes/note-api", () => ({
  createNoteRequest: (...args) => createNoteRequest(...args),
  updateNoteRequest: (...args) => updateNoteRequest(...args),
}));

describe("offline sync queue", () => {
  const userId = "sync-user-1";

  afterEach(async () => {
    createNoteRequest.mockReset();
    updateNoteRequest.mockReset();
    await deleteUserOfflineDatabase(userId);
  });

  it("computes bounded exponential backoff", () => {
    expect(computeSyncBackoffMs(0)).toBe(1000);
    expect(computeSyncBackoffMs(4)).toBe(16_000);
    expect(computeSyncBackoffMs(20)).toBeLessThanOrEqual(60_000);
  });

  it("flushes update mutations in order", async () => {
    updateNoteRequest.mockResolvedValue({
      id: "note-1",
      revision: 2,
      title: "Hi",
      content: {},
    });

    await enqueueNoteMutation(userId, {
      noteId: "note-1",
      op: "update",
      title: "Hi",
      content: {},
      expectedRevision: 1,
      fingerprint: "fp-1",
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    expect(await getPendingSyncCount(userId)).toBe(1);

    const result = await flushMutationQueue(userId);
    expect(result.applied).toBe(1);
    expect(updateNoteRequest).toHaveBeenCalledWith("note-1", {
      expectedRevision: 1,
      title: "Hi",
      content: {},
    });
    expect(await getPendingSyncCount(userId)).toBe(0);
  });

  it("coalesces pending mutations per note", async () => {
    updateNoteRequest.mockResolvedValue({
      id: "note-1",
      revision: 3,
      title: "Final",
      content: {},
    });

    await enqueueNoteMutation(userId, {
      noteId: "note-1",
      op: "update",
      title: "First",
      content: {},
      expectedRevision: 1,
      fingerprint: "fp-1",
      attempts: 0,
      createdAt: new Date().toISOString(),
    });
    await enqueueNoteMutation(userId, {
      noteId: "note-1",
      op: "update",
      title: "Final",
      content: {},
      expectedRevision: 2,
      fingerprint: "fp-2",
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    expect(await getPendingSyncCount(userId)).toBe(1);
    await flushMutationQueue(userId);
    expect(updateNoteRequest).toHaveBeenCalledTimes(1);
    expect(updateNoteRequest.mock.calls[0][1].title).toBe("Final");
  });
});
