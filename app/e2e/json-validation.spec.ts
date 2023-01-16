import { test, expect } from "@playwright/test";

test("Bad field name", async ({ page }) => {
  await page.goto("/");

  const urlInput = page.locator("#data-url-input");
  await expect(urlInput).toBeVisible();
  await urlInput.fill("test-fixtures/json-validation-bad-field-name.json");
  await urlInput.press("Enter");
  await expect(page.locator("#fetchError")).toContainText(
    'Error: Bad value for instance "/elements/reg/fields/0/name". Must be a valid C language identifier. Current value is "field[31:0]".'
  );
});

test("Bad field name (Direct URL)", async ({ page }) => {
  await page.goto("/#/?data=test-fixtures/json-validation-bad-field-name.json");
  await expect(page.locator("#fetchError")).toContainText(
    'Error: Bad value for instance "/elements/reg/fields/0/name". Must be a valid C language identifier. Current value is "field[31:0]".'
  );
});
