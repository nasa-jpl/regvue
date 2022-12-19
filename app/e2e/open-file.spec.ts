import { test, expect } from "@playwright/test";

test.describe("OpenView", () => {
  test("Root shows OpenView", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("Welcome to regvue");
    await expect(page.locator("#data-file-input")).toBeVisible();
    await expect(page.locator("#data-file-drop-zone")).toBeVisible();

    const urlInput = page.locator("#data-url-input");
    await expect(urlInput).toBeVisible();
    await urlInput.type("example.json");
    await urlInput.press("Enter");
    await expect(page).toHaveURL(/\?data=example\.json$/);
  });

  test("Modal when JSON loaded", async ({ page }) => {
    await page.goto("/#/?data=example.json");

    // Initially hidden
    await expect(page.locator("#open-modal-background-div")).toBeHidden();
    await expect(page.locator("#open-modal-div")).toBeHidden();

    // Open modal
    await page.locator("#show-open-modal-button").click();
    await expect(page.locator("#open-modal-background-div")).toBeVisible();
    await expect(page.locator("#open-modal-div")).toBeVisible();

    // Clicking outside (on background) closes modal
    await page
      .locator("#open-modal-background-div")
      .click({ position: { x: 0, y: 0 } });
    await expect(page.locator("#open-modal-background-div")).toBeHidden();
    await expect(page.locator("#open-modal-div")).toBeHidden();

    // Pressing Esc closes
    await page.locator("#show-open-modal-button").click();
    await expect(page.locator("#open-modal-background-div")).toBeVisible();
    await expect(page.locator("#open-modal-div")).toBeVisible();
    await page.press("body", "Escape");
    await expect(page.locator("#open-modal-background-div")).toBeHidden();
    await expect(page.locator("#open-modal-div")).toBeHidden();

    // Clicking modal closes button closes modal
    await page.locator("#show-open-modal-button").click();
    await expect(page.locator("#open-modal-background-div")).toBeVisible();
    await expect(page.locator("#open-modal-div")).toBeVisible();
    await page.locator("#close-open-modal-button").click();
    await expect(page.locator("#open-modal-background-div")).toBeHidden();
    await expect(page.locator("#open-modal-div")).toBeHidden();
  });
});
