import { expect } from "@playwright/test";

/**
 * @param {import("@playwright/test").Page} page
 * @param {string} label
 */
export async function expectSaveStatus(page, label) {
  const status = page
    .locator('[aria-live="polite"]')
    .filter({ hasText: label })
    .locator("visible=true");
  await expect(status).toHaveCount(1);
  await expect(status).toBeVisible();
}

/**
 * @param {import("@playwright/test").Page} page
 */
export function noteTitleInput(page) {
  return page
    .getByRole("textbox", { name: "Note title" })
    .locator("visible=true");
}

/**
 * @param {import("@playwright/test").Page} page
 */
export async function waitForPersistedNoteUrl(page) {
  await expect(page).toHaveURL(/\/notes\/(?!new(?:\?|$))/);
}
