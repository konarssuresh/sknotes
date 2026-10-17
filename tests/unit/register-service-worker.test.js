import { beforeEach, describe, expect, it, vi } from "vitest";

import { syncSwVersionWithMeta } from "@/lib/pwa/register-service-worker";
import { SW_VERSION_STORAGE_KEY } from "@/lib/pwa/sw-session-keys";

const clearCaches = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/pwa/runtime-caches", () => ({
  clearServiceWorkerCaches: () => clearCaches(),
}));

describe("syncSwVersionWithMeta", () => {
  beforeEach(() => {
    clearCaches.mockClear();
    localStorage.clear();
  });

  it("stores version on first visit", async () => {
    await syncSwVersionWithMeta("1.0.0-abc-2026-10-17");
    expect(localStorage.getItem(SW_VERSION_STORAGE_KEY)).toBe(
      "1.0.0-abc-2026-10-17"
    );
    expect(clearCaches).not.toHaveBeenCalled();
  });

  it("clears caches when deploy version changes", async () => {
    localStorage.setItem(SW_VERSION_STORAGE_KEY, "old-version");
    await syncSwVersionWithMeta("new-version");
    expect(clearCaches).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(SW_VERSION_STORAGE_KEY)).toBe("new-version");
  });
});
