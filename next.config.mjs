import { readFileSync } from "node:fs";
import path from "node:path";

function readBuildEnv() {
  try {
    const filePath = path.join(
      process.cwd(),
      "lib",
      "pwa",
      "generated-versions.json"
    );
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return {
      NEXT_PUBLIC_BUILD_ID: String(parsed.buildId ?? "dev"),
      NEXT_PUBLIC_SW_VERSION: String(parsed.swVersion ?? "dev"),
    };
  } catch {
    return {
      NEXT_PUBLIC_BUILD_ID: "dev",
      NEXT_PUBLIC_SW_VERSION: "dev",
    };
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: readBuildEnv(),
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
