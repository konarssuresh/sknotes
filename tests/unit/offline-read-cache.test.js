import { describe, expect, it } from "vitest";

import {
  buildNotesListCacheKey,
  pruneReadCacheEntries,
} from "@/lib/offline/read-cache";
import { READ_CACHE_TTL_MS } from "@/lib/offline/constants";

describe("offline read cache", () => {
  it("builds stable list cache keys", () => {
    expect(buildNotesListCacheKey("active", null, "")).toBe(
      "notes-list:active::"
    );
    expect(buildNotesListCacheKey("active", "t1", "hello")).toBe(
      "notes-list:active:t1:hello"
    );
  });

  it("prunes expired and caps entry count", () => {
    const now = Date.parse("2026-01-10T00:00:00.000Z");
    const entries = [
      { cacheKey: "a", savedAt: "2026-01-09T00:00:00.000Z" },
      { cacheKey: "b", savedAt: "2026-01-08T00:00:00.000Z" },
      {
        cacheKey: "c",
        savedAt: new Date(now - READ_CACHE_TTL_MS - 1000).toISOString(),
      },
    ];
    const pruned = pruneReadCacheEntries(entries, now);
    expect(pruned.map((e) => e.cacheKey)).toEqual(["a", "b"]);
  });
});
