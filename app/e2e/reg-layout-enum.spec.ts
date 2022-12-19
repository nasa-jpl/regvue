import { test, expect } from "@playwright/test";

test.describe("RegLayout Enums", () => {
  test.beforeEach(async ({ page }) => {
    page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");
  });

  test("Mapped value", async ({ page }) => {
    const fieldValue = page.locator("#input-box-long_command");
    await fieldValue.selectText();
    await fieldValue.type("0x5");
    await fieldValue.press("Enter");
    await expect(fieldValue).toHaveValue("START (0x5)");
  });

  test("Mapped value (bin)", async ({ page }) => {
    const fieldValue = page.locator("#input-box-long_command");
    await page.locator("#select-display-type-binary").click();
    await fieldValue.selectText();
    await fieldValue.type("0xa");
    await fieldValue.press("Enter");
    await expect(fieldValue).toHaveValue("STOP (0b1010)");
  });

  test("Unmapped value", async ({ page }) => {
    const fieldValue = page.locator("#input-box-long_command");
    await fieldValue.selectText();
    await fieldValue.type("1");
    await fieldValue.press("Enter");
    await expect(fieldValue).toHaveValue("0x1");
  });
});
