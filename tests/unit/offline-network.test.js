import { describe, expect, it } from "vitest";

import {
  isQueueableNetworkError,
  OfflineQueuedError,
} from "@/lib/offline/network";

describe("offline network helpers", () => {
  it("treats TypeError as queueable", () => {
    expect(isQueueableNetworkError(new TypeError("fetch failed"))).toBe(true);
  });

  it("treats gateway errors as queueable", () => {
    expect(isQueueableNetworkError({ status: 503 })).toBe(true);
    expect(isQueueableNetworkError({ status: 400 })).toBe(false);
  });

  it("marks offline queued errors", () => {
    const err = new OfflineQueuedError();
    expect(err.isOfflineQueued).toBe(true);
  });
});
