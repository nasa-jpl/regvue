import { test, expect, Locator, Page } from "@playwright/test";

type ResultVisibility =
  | "None"
  | "Recents"
  | "NoRecents"
  | "Results"
  | "NoResults";

async function expectVisibility(page: Page, visibility: ResultVisibility) {
  const background = page.locator("#search-background-div");
  const noRecents = page.locator("#no-recent-searches-div");
  const recents = page.locator("#recent-searches-div");
  const results = page.locator("#search-results-div");
  const noResults = page.locator("#no-search-results-div");

  switch (visibility) {
    case "None":
      await expect(background).toBeHidden();
      await expect(recents).toBeHidden();
      await expect(noRecents).toBeHidden();
      await expect(results).toBeHidden();
      await expect(noResults).toBeHidden();
      break;

    case "Recents":
      await expect(background).toBeVisible();
      await expect(recents).toBeVisible();
      await expect(noRecents).toBeHidden();
      await expect(results).toBeHidden();
      await expect(noResults).toBeHidden();
      break;

    case "NoRecents":
      await expect(background).toBeVisible();
      await expect(recents).toBeHidden();
      await expect(noRecents).toBeVisible();
      await expect(results).toBeHidden();
      await expect(noResults).toBeHidden();
      break;

    case "Results":
      await expect(background).toBeVisible();
      await expect(recents).toBeHidden();
      await expect(noRecents).toBeHidden();
      await expect(results).toBeVisible();
      await expect(noResults).toBeHidden();
      break;

    case "NoResults":
      await expect(background).toBeVisible();
      await expect(recents).toBeHidden();
      await expect(noRecents).toBeHidden();
      await expect(results).toBeHidden();
      await expect(noResults).toBeVisible();
      break;
  }
}

async function expectSelected(locator: Locator) {
  await expect(locator).toHaveClass(/\boutline-blue-500\b/);
}

async function expectNotSelected(locator: Locator) {
  await expect(locator).not.toHaveClass(/\boutline-blue-500\b/);
}

async function searchAndNavigate(page: Page, element: string) {
  const searchInput = page.locator("#search-input");
  const suggestions = page.locator("[id^=suggestion-]");
  const nameRegexp = new RegExp(`\\b${element}\\b`);

  await searchInput.fill(element);
  // Wait for first suggestion to contain the search text before
  // navigating otherwise we might attempt to navigate before the search
  // results have been populated
  await expectSelected(suggestions.first());
  await expect(suggestions.first()).toContainText(element);
  await searchInput.press("Enter");
  await expect(page).toHaveURL(nameRegexp);
}

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    page.goto("/#/?data=example.json");
  });

  test("Initial state", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await expect(searchInput).toHaveValue("");
    await expect(searchInput).toHaveAttribute("placeholder", "Search");

    await expectVisibility(page, "None");
  });

  test("Shows recents on focus", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await searchInput.focus();

    await expectVisibility(page, "NoRecents");
    await expect(page.locator("#no-recent-searches-div")).toHaveText(
      "No recent searches"
    );

    await expect(page.locator("[id^=suggestion-]")).toBeHidden();
  });

  test("Hides on blur", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await searchInput.focus();
    await expectVisibility(page, "NoRecents");

    const background = page.locator("#search-background-div");
    await background.click();
    await expectVisibility(page, "None");

    await searchInput.fill("r");
    await expectVisibility(page, "Results");

    await background.click();
    await expectVisibility(page, "None");
  });

  test("Hides on esc", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await searchInput.focus();
    await expectVisibility(page, "NoRecents");

    await searchInput.press("Escape");
    await expectVisibility(page, "None");

    await searchInput.fill("r");
    await expectVisibility(page, "Results");

    await searchInput.press("Escape");
    await expectVisibility(page, "None");
  });

  test("Enter navigates to first result", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await searchInput.fill("regA0");
    await expectVisibility(page, "Results");
    await expectSelected(page.locator("#suggestion-0"));

    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\bregA0\b/);
  });

  test("Select result using ArrowDown key", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    const suggestion0 = page.locator("#suggestion-0");
    const suggestion1 = page.locator("#suggestion-1");

    await searchInput.fill("r");
    await expectVisibility(page, "Results");
    await expectSelected(suggestion0);
    await expectNotSelected(suggestion1);

    await searchInput.press("ArrowDown");
    await expectNotSelected(suggestion0);
    await expectSelected(suggestion1);

    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\bregA1\b/);
  });

  test("Select result using ArrowUp key", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    const suggestion0 = page.locator("#suggestion-0");
    const suggestion1 = page.locator("#suggestion-1");

    await searchInput.fill("r");
    await expectVisibility(page, "Results");

    await searchInput.press("ArrowDown");
    await searchInput.press("ArrowUp");
    await expectSelected(suggestion0);
    await expectNotSelected(suggestion1);

    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\bregA0\b/);
  });

  test("Shows max recent searches", async ({ page }) => {
    const MAX_RECENTS = 5;

    const searchInput = page.locator("#search-input");
    const suggestions = page.locator("[id^=suggestion-]");
    const resultNames = page.locator(".search-result-name");
    const elements = ["regA0", "regA1", "regA2", "regA3", "regA4", "regA5"];

    for (let i = 0; i < elements.length; i++) {
      const element = <string>elements[i];

      await searchAndNavigate(page, element);

      await searchInput.focus();
      await expect(resultNames.first()).toHaveText(element);
      const expectedCount = Math.min(MAX_RECENTS, i + 1);
      await expect(suggestions).toHaveCount(expectedCount);
    }
  });

  test("Can remove recent searches", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    const resultNames = page.locator(".search-result-name");
    const suggestions = page.locator("[id^=suggestion-]");

    await searchAndNavigate(page, "regA0");
    await searchAndNavigate(page, "regA1");

    await searchInput.focus();
    await page.locator("#remove-recent-search-btn-0").click();
    await expect(resultNames.first()).toHaveText("regA0");
    await expect(suggestions).toHaveCount(1);
  });

  test("Most recent first", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    const resultNames = page.locator(".search-result-name");
    const suggestions = page.locator("[id^=suggestion-]");

    await searchAndNavigate(page, "regA0");
    await searchAndNavigate(page, "regA1");
    await searchAndNavigate(page, "regA0");

    await searchInput.focus();
    await expect(resultNames.first()).toHaveText("regA0");
    await expect(suggestions).toHaveCount(2);
  });

  test("Opens with beyboard shortcut", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await searchInput.waitFor();

    await page.locator("body").press("Control+k");
    await expect(searchInput).toBeFocused();
    await expectVisibility(page, "NoRecents");

    await page.locator("body").press("Control+k");
    await expect(searchInput).not.toBeFocused();
    await expectVisibility(page, "None");
  });
});
