import { test, expect } from "@playwright/test";

import data from "../public/example.json";

test.describe("Header", () => {
  test("Shows", async ({ page }) => {
    await page.goto("/#/?data=example.json");

    const header_children = page.locator("#header-bar > div");
    await expect(header_children).toHaveCount(3);

    const header_title = page.locator("#header-title");
    await expect(header_title).toHaveText(
      `${data.root.desc} (${data.root.version})`
    );

    const header_links = page.locator("#header-links").locator("a");
    await expect(header_links).toHaveText("GitHub");
    await expect(header_links).toHaveAttribute(
      "href",
      "https://github.jpl.nasa.gov/regvue/regvue"
    );

    const search_input = page.locator("#search-input");
    await expect(search_input).toBeVisible();
  });
});
