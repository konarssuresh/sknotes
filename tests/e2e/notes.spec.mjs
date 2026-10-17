import { test, expect } from "@playwright/test";

import { expectSaveStatus, noteTitleInput } from "./helpers.mjs";

test.describe("notes", () => {
  test("create note, autosave, and search by title", async ({ page }) => {
    const uniqueTitle = `E2E note ${Date.now()}`;

    await page.goto("/notes/new");
    await expect(noteTitleInput(page)).toBeVisible();

    await noteTitleInput(page).fill(uniqueTitle);
    await expectSaveStatus(page, "Saved");

    await page.goto("/notes");
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

    await page.getByLabel("Search notes").fill(uniqueTitle);
    await expect(page.getByRole("link", { name: uniqueTitle })).toBeVisible();
  });
});
