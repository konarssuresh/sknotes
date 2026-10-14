import { describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "@/lib/theme/constants";
import {
  readStoredThemeMode,
  shouldUseDarkClass,
} from "@/lib/theme/resolve-dark-class";

describe("shouldUseDarkClass", () => {
  it("respects explicit light and dark", () => {
    expect(shouldUseDarkClass("light", true)).toBe(false);
    expect(shouldUseDarkClass("dark", false)).toBe(true);
  });

  it("follows system preference when mode is system", () => {
    expect(shouldUseDarkClass("system", true)).toBe(true);
    expect(shouldUseDarkClass("system", false)).toBe(false);
  });
});

describe("readStoredThemeMode", () => {
  it("defaults to system when storage is missing", () => {
    expect(readStoredThemeMode(null)).toBe("system");
  });

  it("reads valid stored values", () => {
    const storage = {
      getItem: (key) => (key === THEME_STORAGE_KEY ? "dark" : null),
    };
    expect(readStoredThemeMode(storage)).toBe("dark");
  });

  it("falls back for invalid values", () => {
    const storage = {
      getItem: () => "invalid",
    };
    expect(readStoredThemeMode(storage)).toBe("system");
  });
});
