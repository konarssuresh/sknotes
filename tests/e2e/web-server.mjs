import { spawn } from "node:child_process";

import { startMemoryMongo } from "../helpers/mongo-memory.js";

const HOST = process.env.PLAYWRIGHT_HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT || process.env.PLAYWRIGHT_PORT || 3000);
const baseURL = `http://${HOST}:${PORT}`;

/**
 * @param {string} command
 * @param {string[]} args
 * @param {NodeJS.ProcessEnv} env
 */
function runCommand(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env,
      shell: false,
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(" ")} exited with code ${code ?? "null"} (${signal ?? "no signal"})`
        )
      );
    });
  });
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) {
        return;
      }
    } catch {
      // Server still booting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

await startMemoryMongo();

const env = {
  ...process.env,
  NODE_ENV: "production",
  E2E_TEST_MODE: "1",
  PORT: String(PORT),
  HOSTNAME: HOST,
  BETTER_AUTH_URL: baseURL,
  NEXT_PUBLIC_BETTER_AUTH_URL: baseURL,
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "e2e-resend-placeholder",
};

await runCommand("npm", ["run", "build"], env);

const server = spawn(
  "npm",
  ["run", "start", "--", "-p", String(PORT), "-H", HOST],
  {
    stdio: "inherit",
    env,
  }
);

function shutdown() {
  server.kill("SIGTERM");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
server.on("exit", (code) => {
  process.exit(code ?? 0);
});

await waitForServer(baseURL, 120_000);

console.log(`[e2e] App ready at ${baseURL}`);
