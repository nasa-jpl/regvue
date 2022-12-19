import { test, expect } from "@playwright/test";

test.describe("Register fields table", () => {
  test("Order by bits", async ({ page }) => {
    await page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");

    // Starts with displaying MSB field first
    await expect(page.locator("#bit-range-0")).toHaveText("31:8");
    await expect(page.locator("[id^=bit-range-]").last()).toHaveText("0");

    // Can toggle to show LSB field first
    await page.locator("#toggle-field-display-order-button").click();
    await expect(page.locator("#bit-range-0")).toHaveText("0");
    await expect(page.locator("[id^=bit-range-]").last()).toHaveText("31:8");

    // Preserves decision on reload
    await page.reload();
    await expect(page.locator("#bit-range-0")).toHaveText("0");
    await expect(page.locator("[id^=bit-range-]").last()).toHaveText("31:8");

    // Can toggle back
    await page.locator("#toggle-field-display-order-button").click();
    await expect(page.locator("#bit-range-0")).toHaveText("31:8");
    await expect(page.locator("[id^=bit-range-]").last()).toHaveText("0");
  });
});
