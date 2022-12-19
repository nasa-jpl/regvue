import { test, expect } from "@playwright/test";

test.describe("Include", () => {
  test("Hierarchy", async ({ page }) => {
    await page.goto("/#/?data=include.json");
    await expect(page.locator("#element-name")).toHaveText("Include Example");

    await page.goto("/#/root/top_blk?data=include.json");
    await expect(page.locator("#element-name")).toHaveText("top_blk");

    await page.goto("/#/root/top_blk/include1?data=include.json");
    await expect(page.locator("#element-name")).toHaveText("Include 1");

    await page.goto("/#/root/top_blk/include2?data=include.json");
    await expect(page.locator("#element-name")).toHaveText("Include 2");

    await page.goto("/#/root/top_blk/include1/blkA?data=include.json");
    await expect(page.locator("#element-name")).toHaveText("blkA");

    await page.goto("/#/root/top_blk/include1/blkB?data=include.json");
    await expect(page.locator("#element-name")).toHaveText("blkB");
  });

  test("Supports embedded HTML", async ({ page }) => {
    await page.goto("/#/root/top_blk/include1?data=include.json");

    const locator = page.locator("h6").first();
    await expect(locator).toHaveText("Embedded html - include");
  });
});
