import { afterEach, describe, expect, it } from "vitest";

import {
  readRecoveryDraft,
  writeRecoveryDraft,
} from "@/features/notes/recovery-draft";
import { getLegacyRecoveryStorageKey } from "@/lib/offline/legacy-local-storage";
import { deleteUserOfflineDatabase } from "@/lib/offline/db";

describe("legacy localStorage recovery import", () => {
  const userId = "legacy-user";

  afterEach(async () => {
    localStorage.removeItem(getLegacyRecoveryStorageKey(userId));
    await deleteUserOfflineDatabase(userId);
  });

  it("imports legacy localStorage drafts into IndexedDB once", async () => {
    localStorage.setItem(
      getLegacyRecoveryStorageKey(userId),
      JSON.stringify({
        "draft-x": {
          title: "Imported",
          content: { root: {} },
          savedAt: "2026-02-01T00:00:00.000Z",
        },
      })
    );

    const draft = await readRecoveryDraft(userId, "draft-x");
    expect(draft?.title).toBe("Imported");
    expect(
      localStorage.getItem(getLegacyRecoveryStorageKey(userId))
    ).toBeNull();
  });

  it("writes new drafts without legacy storage", async () => {
    await writeRecoveryDraft(userId, "draft-y", {
      title: "Fresh",
      content: {},
      savedAt: "2026-02-02T00:00:00.000Z",
    });
    const draft = await readRecoveryDraft(userId, "draft-y");
    expect(draft?.title).toBe("Fresh");
  });
});
