import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { test as setup, expect } from "@playwright/test";

import { E2E_USER_EMAIL, E2E_USER_PASSWORD } from "./constants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, ".auth/user.json");

setup("seed user and persist session", async ({ request }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const seed = await request.post("/api/e2e/seed");
  expect(seed.ok(), await seed.text()).toBeTruthy();

  const signIn = await request.post("/api/auth/sign-in/email", {
    data: {
      email: E2E_USER_EMAIL,
      password: E2E_USER_PASSWORD,
      callbackURL: "/",
    },
  });
  expect(signIn.ok(), await signIn.text()).toBeTruthy();

  await request.storageState({ path: authFile });
});
