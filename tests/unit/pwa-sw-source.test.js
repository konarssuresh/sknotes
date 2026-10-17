import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { formatSwVersion } from "@/lib/pwa/sw-version";
import { validateServiceWorkerSource } from "@/lib/pwa/validate-sw-source";

const swPath = path.join(process.cwd(), "public", "sw.js");

describe("public/sw.js source (pre-build)", () => {
  it("keeps the inject placeholder and network-first static policy", () => {
    const source = readFileSync(swPath, "utf8");
    const errors = validateServiceWorkerSource(source);
    expect(errors).toEqual([]);
  });
});

describe("formatSwVersion", () => {
  it("combines package version, git sha, and date", () => {
    expect(
      formatSwVersion({
        packageVersion: "0.1.0",
        gitSha: "abc1234",
        buildDate: "2026-10-17",
      })
    ).toBe("0.1.0-abc1234-2026-10-17");
  });
});
