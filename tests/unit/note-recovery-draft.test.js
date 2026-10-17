import { afterEach, describe, expect, it } from "vitest";

import {
  clearRecoveryDraft,
  readRecoveryDraft,
  writeRecoveryDraft,
} from "@/features/notes/recovery-draft";

describe("recovery draft storage", () => {
  const userId = "user-test-1";

  afterEach(async () => {
    await clearRecoveryDraft(userId, "draft-a");
    await clearRecoveryDraft(userId, "draft-b");
  });

  it("stores and reads user-scoped drafts", async () => {
    await writeRecoveryDraft(userId, "draft-a", {
      title: "A",
      content: { root: {} },
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    const read = await readRecoveryDraft(userId, "draft-a");
    expect(read?.title).toBe("A");
  });

  it("isolates drafts by user id", async () => {
    await writeRecoveryDraft(userId, "draft-a", {
      title: "Secret",
      content: {},
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(await readRecoveryDraft("other-user", "draft-a")).toBeNull();
  });
});
