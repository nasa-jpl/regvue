import { test, expect } from "@playwright/test";

test.describe("Embedded HTML", () => {
  test("Root", async ({ page }) => {
    await page.goto("/#/?data=example.json");

    const locator = page.locator("h6");
    await expect(locator).toHaveText([
      "Embedded html - example",
      "Embedded html - blkA",
    ]);
  });

  test("Block", async ({ page }) => {
    await page.goto("/#/root/blkA?data=example.json");

    const locator = page.locator("h6");
    await expect(locator).toHaveText([
      "Embedded html - blkA",
      "Embedded html - sub_blkA",
    ]);
  });

  test("Register", async ({ page }) => {
    await page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");

    const locator = page.locator("h6");
    await expect(locator).toHaveText([
      "Embedded html - regA0",
      "Embedded html - rsvd",
      "Embedded html - enum",
    ]);
  });
});
