import { test, expect } from "@playwright/test";

test.describe("Collapsed Menu", () => {
  // Make viewport small enough so that the menu is hidden
  test.use({ viewport: { width: 1000, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");
  });

  test("visibility can be toggled", async ({ page }) => {
    const menu = page.locator("#navigation-menu");
    const menuToggle = page.locator("#toggle-menu-button");

    await expect(menu).toBeHidden();
    await menuToggle.click();
    await expect(menu).toBeVisible();
    await menuToggle.click();
    await expect(menu).toBeHidden();
  });

  test("closes on background click", async ({ page }) => {
    const menu = page.locator("#navigation-menu");
    const menuToggle = page.locator("#toggle-menu-button");
    const menuBackground = page.locator("#menu-background-div");

    await expect(menu).toBeHidden();
    await menuToggle.click();
    await expect(menu).toBeVisible();
    await menuBackground.click();
    await expect(menu).toBeHidden();
  });
});
