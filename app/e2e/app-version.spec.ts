import { test, expect } from "@playwright/test";

import packageInfo from "../package.json";

test("Version component", async ({ page }) => {
  await page.goto("/");

  const appVersion = page.locator("#app-version");
  await expect(appVersion).toHaveText(
    `Powered by ${packageInfo.name} v${packageInfo.version}`
  );
  await expect(appVersion).toBeVisible();

  const appUrl = page.locator("#app-source-url");
  await expect(appUrl).toHaveAttribute("href", packageInfo.homepage);
});
