import { describe, expect, it } from "vitest";

import {
  isNetworkOnlyPath,
  isStaticPrecacheCandidate,
} from "@/lib/pwa/cache-policy";

describe("PWA cache policy", () => {
  it("never caches API or auth HTML", () => {
    expect(isNetworkOnlyPath("/api/notes")).toBe(true);
    expect(isNetworkOnlyPath("/login")).toBe(true);
    expect(isNetworkOnlyPath("/signup")).toBe(true);
  });

  it("uses network-only for signed-in app routes", () => {
    expect(isNetworkOnlyPath("/")).toBe(true);
    expect(isNetworkOnlyPath("/notes")).toBe(true);
    expect(isNetworkOnlyPath("/notes/abc123")).toBe(true);
    expect(isNetworkOnlyPath("/settings")).toBe(true);
    expect(isNetworkOnlyPath("/tags")).toBe(true);
  });

  it("allows precache only for static build assets and icons", () => {
    expect(isStaticPrecacheCandidate("/_next/static/chunks/foo.js")).toBe(true);
    expect(isStaticPrecacheCandidate("/icon.svg")).toBe(true);
    expect(isStaticPrecacheCandidate("/icons/icon-192.png")).toBe(true);
    expect(isStaticPrecacheCandidate("/notes")).toBe(false);
  });
});
