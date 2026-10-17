import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * @returns {{ swVersion: string, buildId: string }}
 */
export function readGeneratedVersions() {
  try {
    const filePath = path.join(
      process.cwd(),
      "lib",
      "pwa",
      "generated-versions.json"
    );
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return {
      swVersion: String(parsed.swVersion ?? "dev"),
      buildId: String(parsed.buildId ?? "dev"),
    };
  } catch {
    return { swVersion: "dev", buildId: "dev" };
  }
}
