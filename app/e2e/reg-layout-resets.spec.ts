import { test, expect } from "@playwright/test";

test.describe("RegLayout Resets", () => {
  test("Can reset values", async ({ page }) => {
    page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");

    const registerValue = page.locator("#input-box-register");
    await expect(registerValue).toHaveValue("0x00000000");

    // Make the value non-zero
    const hexValue = "0xFFFFFFFF";
    await registerValue.clear();
    await registerValue.type(hexValue);
    await expect(registerValue).toHaveValue(hexValue);
    await expect(page.locator("#input-box-rsvd")).toHaveValue("0xFFFFFF");

    // Reset the value
    await page.locator("#reset-values-button").click();
    await expect(registerValue).toHaveValue("0x00000000");
    await expect(page.locator("#input-box-rsvd")).toHaveValue("0x000000");
  });

  test("Can swap between reset values", async ({ page }) => {
    page.goto("/#/root/blkA/sub_blkA/regA2?data=example.json");

    const registerValue = page.locator("#input-box-register");

    // Ensure that the reset states button starts off with the defaults
    await expect(page.locator("#reset-values-button")).toHaveText("RS1");
    await page.locator("#reset-states-dropdown-button").click();
    await expect(page.locator("#reset-states-div")).toBeVisible();

    // Choose the next reset state
    await page.locator("#select-reset-state-0").click();
    await expect(page.locator("#reset-values-button")).toHaveText("RS2");
    await page.locator("#reset-values-button").click();
    await expect(page.locator("#reset-states-div")).toBeHidden();
    await expect(registerValue).toHaveValue("0x??????00");

    await page.locator("#reset-states-dropdown-button").click();
    await page.locator("#select-reset-state-0").click();
    await expect(registerValue).toHaveValue("0x??020100");
  });
});
