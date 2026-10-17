import { describe, expect, it } from "vitest";

import { getPwaVersionSyncInlineScript } from "@/lib/pwa/version-sync-inline-script";
import { SW_VERSION_STORAGE_KEY } from "@/lib/pwa/sw-session-keys";

describe("getPwaVersionSyncInlineScript", () => {
  it("references sknotes-sw-version meta and storage key", () => {
    const script = getPwaVersionSyncInlineScript();
    expect(script).toContain('meta[name="sknotes-sw-version"]');
    expect(script).toContain(SW_VERSION_STORAGE_KEY);
    expect(script).toContain("unregister");
    expect(script).toContain("caches.keys");
  });
});
