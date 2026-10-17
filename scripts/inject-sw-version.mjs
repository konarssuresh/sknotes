import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SKNOTES_SW_VERSION_PLACEHOLDER,
  formatSwVersion,
} from "../lib/pwa/sw-version.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const swPath = path.join(root, "public", "sw.js");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

function resolveGitSha() {
  if (process.env.COMMIT_REF) {
    return String(process.env.COMMIT_REF).slice(0, 12);
  }
  if (process.env.GITHUB_SHA) {
    return String(process.env.GITHUB_SHA).slice(0, 12);
  }
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "nogit";
  }
}

const version = formatSwVersion({
  packageVersion: pkg.version,
  gitSha: resolveGitSha(),
});

let source = readFileSync(swPath, "utf8");
const needle = `const SKNOTES_SW_VERSION = "${SKNOTES_SW_VERSION_PLACEHOLDER}";`;
if (!source.includes(needle)) {
  console.error(
    `inject-sw-version: expected placeholder line in public/sw.js:\n  ${needle}`
  );
  process.exit(1);
}

source = source.replace(needle, `const SKNOTES_SW_VERSION = "${version}";`);
writeFileSync(swPath, source, "utf8");
console.log(`inject-sw-version: SKNOTES_SW_VERSION=${version}`);
