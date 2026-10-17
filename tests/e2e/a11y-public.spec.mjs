import { test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./a11y-helpers.mjs";

test("login meets WCAG 2.2 AA (no serious/critical axe)", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor();
  await expectNoSeriousAxeViolations(page, "login");
});

test("sign-up meets WCAG 2.2 AA (no serious/critical axe)", async ({
  page,
}) => {
  await page.goto("/sign-up");
  await page.getByRole("button", { name: /create account/i }).waitFor();
  await expectNoSeriousAxeViolations(page, "sign-up");
});
