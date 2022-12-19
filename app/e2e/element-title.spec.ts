import { test, expect } from "@playwright/test";

test("Element title component", async ({ page }) => {
  await page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");

  await expect(page.locator("#breadcrumb-links")).toHaveText(
    "- blkA.sub_blkA.regA0"
  );

  await page.locator("#breadcrumb-link-sub_blkA").click();
  await expect(page).toHaveURL(
    /.*#\/root\/blkA\/sub_blkA\?data=example\.json$/
  );

  await page.locator("#breadcrumb-link-blkA").click();
  await expect(page).toHaveURL(/.*#\/root\/blkA\?data=example\.json$/);
});
