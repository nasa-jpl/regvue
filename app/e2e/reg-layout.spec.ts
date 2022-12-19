import { test, expect, Page } from "@playwright/test";

test.describe("RegLayout", () => {
  test.beforeEach(async ({ page }) => {
    page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");
  });

  test("Change to field values updates register value", async ({ page }) => {
    const registerValue = page.locator("#input-box-register");
    await expect(registerValue).toHaveValue("0x00000000");

    await page.locator("#input-box-flag0").clear();
    await page.locator("#input-box-flag0").type("1");
    await expect(registerValue).toHaveValue("0x00000001");

    await page.locator("#input-box-rsvd").clear();
    await page.locator("#input-box-rsvd").type("0xABCDEF");
    await expect(registerValue).toHaveValue("0xABCDEF01");

    await page.locator("#input-box-flag1").clear();
    await page.locator("#input-box-flag1").type("1");
    await expect(registerValue).toHaveValue("0xABCDEF03");
  });

  const hexValue = "0xABCDEF12";
  const binValue = "0b" + parseInt(hexValue).toString(2);
  const decValue = parseInt(hexValue).toString();
  const assertFieldValues = async (page: Page) => {
    await expect(page.locator("#input-box-rsvd")).toHaveValue("0xABCDEF");
    await expect(page.locator("#input-box-long_command")).toHaveValue("0x1");
    await expect(page.locator("#input-box-flag3")).toHaveValue("0");
    await expect(page.locator("#input-box-flag2")).toHaveValue("0");
    await expect(page.locator("#input-box-flag1")).toHaveValue("1");
    await expect(page.locator("#input-box-flag0")).toHaveValue("0");
  };

  test("Change to register value updates field values (hex)", async ({
    page,
  }) => {
    const registerValue = page.locator("#input-box-register");

    await registerValue.clear();
    await registerValue.type(hexValue);
    await assertFieldValues(page);
  });

  test("Change to register value updates field values (bin)", async ({
    page,
  }) => {
    const registerValue = page.locator("#input-box-register");

    await registerValue.clear();
    await registerValue.type(binValue);
    await assertFieldValues(page);
  });

  test("Change to register value updates field values (dec)", async ({
    page,
  }) => {
    const registerValue = page.locator("#input-box-register");

    await registerValue.clear();
    await registerValue.type(decValue);
    await assertFieldValues(page);
  });

  test("Can change display base", async ({ page }) => {
    const registerValue = page.locator("#input-box-register");

    await registerValue.clear();
    await registerValue.type(hexValue);
    await expect(registerValue).toHaveValue(hexValue);

    // Bin
    await page.locator("#select-display-type-binary").click();
    await expect(registerValue).toHaveValue(binValue);
    await expect(page.locator("#input-box-rsvd")).toHaveValue(
      "0b101010111100110111101111"
    );
    await expect(page.locator("#input-box-long_command")).toHaveValue("0b0001");
    await expect(page.locator("#input-box-flag3")).toHaveValue("0");
    await expect(page.locator("#input-box-flag2")).toHaveValue("0");
    await expect(page.locator("#input-box-flag1")).toHaveValue("1");
    await expect(page.locator("#input-box-flag0")).toHaveValue("0");

    // Dec
    await page.locator("#select-display-type-decimal").click();
    await expect(registerValue).toHaveValue(decValue);
    await expect(page.locator("#input-box-rsvd")).toHaveValue("11259375");
    await expect(page.locator("#input-box-long_command")).toHaveValue("1");
    await expect(page.locator("#input-box-flag3")).toHaveValue("0");
    await expect(page.locator("#input-box-flag2")).toHaveValue("0");
    await expect(page.locator("#input-box-flag1")).toHaveValue("1");
    await expect(page.locator("#input-box-flag0")).toHaveValue("0");

    // Hex
    await page.locator("#select-display-type-hexadecimal").click();
    await expect(registerValue).toHaveValue(hexValue);
    await expect(page.locator("#input-box-rsvd")).toHaveValue("0xABCDEF");
    await expect(page.locator("#input-box-long_command")).toHaveValue("0x1");
    await expect(page.locator("#input-box-flag3")).toHaveValue("0");
    await expect(page.locator("#input-box-flag2")).toHaveValue("0");
    await expect(page.locator("#input-box-flag1")).toHaveValue("1");
    await expect(page.locator("#input-box-flag0")).toHaveValue("0");
  });

  test("Can byte swap", async ({ page }) => {
    const registerValue = page.locator("#input-box-register");

    await registerValue.clear();
    await registerValue.type(hexValue);

    // Byte swap on
    await page.locator("#toggle-byte-swap-button").click();
    await expect(registerValue).toHaveValue("0x12EFCDAB");
    await assertFieldValues(page);

    // Byte swap off
    await page.locator("#toggle-byte-swap-button").click();
    await expect(registerValue).toHaveValue(hexValue);
    await assertFieldValues(page);
  });

  test("Can word swap", async ({ page }) => {
    const registerValue = page.locator("#input-box-register");

    await registerValue.clear();
    await registerValue.type(hexValue);

    // Word swap on
    await page.locator("#toggle-word-swap-button").click();
    await expect(registerValue).toHaveValue("0xEF12ABCD");
    await assertFieldValues(page);

    // Word swap off
    await page.locator("#toggle-word-swap-button").click();
    await expect(registerValue).toHaveValue(hexValue);
    await assertFieldValues(page);
  });

  test("Supports unknown values", async ({ page }) => {
    const registerValue = page.locator("#input-box-register");

    await registerValue.clear();
    await registerValue.type("0xABCDEF1?");
    await expect(page.locator("#input-box-rsvd")).toHaveValue("0xABCDEF");
    await expect(page.locator("#input-box-long_command")).toHaveValue("0x1");
    await expect(page.locator("#input-box-flag3")).toHaveValue("?");
    await expect(page.locator("#input-box-flag2")).toHaveValue("?");
    await expect(page.locator("#input-box-flag1")).toHaveValue("?");
    await expect(page.locator("#input-box-flag0")).toHaveValue("?");

    await page.locator("#input-box-long_command").clear();
    await page.locator("#input-box-long_command").type("0b0?00");
    await expect(registerValue).toHaveValue("0xABCDEF??");

    // Changing the display type doesn't result in loss of information
    await page.locator("#select-display-type-binary").click();
    await expect(registerValue).toHaveValue(
      "0b1010101111001101111011110?00????"
    );
    await expect(page.locator("#input-box-rsvd")).toHaveValue(
      "0b101010111100110111101111"
    );
    await expect(page.locator("#input-box-long_command")).toHaveValue("0b0?00");
    await expect(page.locator("#input-box-flag3")).toHaveValue("?");
    await expect(page.locator("#input-box-flag2")).toHaveValue("?");
    await expect(page.locator("#input-box-flag1")).toHaveValue("?");
    await expect(page.locator("#input-box-flag0")).toHaveValue("?");

    await page.locator("#select-display-type-decimal").click();
    await expect(registerValue).toHaveValue("?");
    await expect(page.locator("#input-box-rsvd")).toHaveValue("11259375");
    await expect(page.locator("#input-box-long_command")).toHaveValue("?");
  });
});
