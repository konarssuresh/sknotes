import { test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./a11y-helpers.mjs";

test("home meets WCAG 2.2 AA (no serious/critical axe)", async ({ page }) => {
  await page.goto("/");
  await page.locator("#main-content").waitFor();
  await expectNoSeriousAxeViolations(page, "home");
});

test("notes list meets WCAG 2.2 AA (no serious/critical axe)", async ({
  page,
}) => {
  await page.goto("/notes");
  await page.getByRole("heading", { name: /notes/i }).waitFor();
  await expectNoSeriousAxeViolations(page, "notes");
});

test("settings meets WCAG 2.2 AA (no serious/critical axe)", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("heading", { name: /settings/i }).waitFor();
  await expectNoSeriousAxeViolations(page, "settings");
});

test("tags meets WCAG 2.2 AA (no serious/critical axe)", async ({ page }) => {
  await page.goto("/tags");
  await page.getByRole("heading", { name: /tags/i }).waitFor();
  await expectNoSeriousAxeViolations(page, "tags");
});
