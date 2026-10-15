import { afterEach, describe, expect, it } from "vitest";

import {
  clearRecoveryDraft,
  readRecoveryDraft,
  writeRecoveryDraft,
} from "@/features/notes/recovery-draft";

describe("recovery draft storage", () => {
  const userId = "user-test-1";

  afterEach(() => {
    clearRecoveryDraft(userId, "draft-a");
    clearRecoveryDraft(userId, "draft-b");
  });

  it("stores and reads user-scoped drafts", () => {
    writeRecoveryDraft(userId, "draft-a", {
      title: "A",
      content: { root: {} },
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    const read = readRecoveryDraft(userId, "draft-a");
    expect(read?.title).toBe("A");
  });

  it("isolates drafts by user id", () => {
    writeRecoveryDraft(userId, "draft-a", {
      title: "Secret",
      content: {},
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(readRecoveryDraft("other-user", "draft-a")).toBeNull();
  });
});
