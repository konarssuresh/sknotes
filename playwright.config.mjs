import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 60_000,
  expect: {
    timeout: 20_000,
  },
  use: {
    baseURL,
    extraHTTPHeaders: {
      Origin: baseURL,
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "a11y-public",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /a11y-public\.spec\.mjs/,
    },
    {
      name: "setup",
      testMatch: /auth\.setup\.mjs/,
    },
    {
      name: "chromium",
      testIgnore: /a11y-public\.spec\.mjs/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "node tests/e2e/web-server.mjs",
    url: `${baseURL}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
