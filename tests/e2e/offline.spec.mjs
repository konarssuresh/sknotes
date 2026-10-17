import { test, expect } from "@playwright/test";

import {
  expectSaveStatus,
  noteTitleInput,
  waitForPersistedNoteUrl,
} from "./helpers.mjs";

test.describe("offline sync", () => {
  test("queues edits offline then syncs when back online", async ({
    page,
    context,
  }) => {
    const uniqueTitle = `Offline ${Date.now()}`;

    await page.goto("/notes/new");
    await noteTitleInput(page).fill(uniqueTitle);
    await expectSaveStatus(page, "Saved");
    await waitForPersistedNoteUrl(page);

    await context.setOffline(true);
    const offlineTitle = `${uniqueTitle} edited`;
    await noteTitleInput(page).fill(offlineTitle);
    await expectSaveStatus(page, "Pending sync");

    const synced = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        /\/api\/notes\/[^/]+$/.test(response.url()) &&
        response.ok()
    );
    await context.setOffline(false);
    await synced;
    await expect(noteTitleInput(page)).toHaveValue(offlineTitle);
    await page.reload();
    await expect(noteTitleInput(page)).toHaveValue(offlineTitle);
  });
});
