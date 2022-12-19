import { test, expect, Locator, Page } from "@playwright/test";

import { hex } from "../src/format";
import data from "../public/example.json";

async function expectSelected(locator: Locator) {
  const classRegexp = /\bbg-blue-200\b/;
  await expect(locator).toHaveClass(classRegexp);
}

async function expectNotSelected(locator: Locator) {
  const classRegexp = /\bbg-blue-200\b/;
  await expect(locator).not.toHaveClass(classRegexp);
}

async function expectExpandedCount(page: Page, additional: number) {
  const menuItems = page.locator("[id^=menu-node-]");
  const expectedCount = data.root.expanded
    .map((id) => (data.elements as any)[id].children.length)
    .reduce((a, b) => a + b, additional + data.root.children.length);
  await expect(menuItems).toHaveCount(expectedCount);
}

test.describe("Menu", () => {
  // Make viewport large so that the menu is visible
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/#/root/blkA/sub_blkA/regA0?data=example.json");
  });

  test("Shows the expanded root nodes", async ({ page }) => {
    await expectExpandedCount(page, 0);

    await Promise.all(
      data.root.children.map(async (child_id) => {
        const selector = "#menu-node-" + child_id.replaceAll(".", "-");
        const childName = (data.elements as any)[child_id].name;
        const childOffset = (data.elements as any)[child_id].offset;
        const expectedText = childName + hex(childOffset);

        await expect(page.locator(selector)).toHaveText(expectedText);
      })
    );
  });

  test("Highlights only one menu item (first)", async ({ page }) => {
    const menuItems = page.locator("[id^=menu-node-]");
    await menuItems.last().click();
    await menuItems.first().click();

    const [firstMenuItem, ...remainingMenuItems] = await menuItems.all();
    await expectSelected(<Locator>firstMenuItem);
    await Promise.all(
      remainingMenuItems.map(async (menuItem) => {
        await expectNotSelected(menuItem);
      })
    );
  });

  test("Highlights only one menu item (last)", async ({ page }) => {
    const menuItems = page.locator("[id^=menu-node-]");
    await menuItems.first().click();
    await menuItems.last().click();

    await expectSelected(menuItems.last());
    const remainingMenuItems = (await menuItems.all()).slice(0, -1);
    await Promise.all(
      remainingMenuItems.map(async (menuItem) => {
        await expectNotSelected(menuItem);
      })
    );
  });

  test("toggles children visibility on click", async ({ page }) => {
    const rootElements = data.root.children;
    const subElements = (data.elements as any)[<string>rootElements[0]]
      .children;

    const menuItems = page.locator("[id^=menu-node-]");
    const closeMenuItemButtons = page.locator(".close-menu-node-btn");
    const openMenuItemButtons = page.locator(".open-menu-node-btn");

    await closeMenuItemButtons.first().click();
    await closeMenuItemButtons.first().click();
    await expect(menuItems).toHaveCount(rootElements.length);

    await openMenuItemButtons.first().click();
    await expect(menuItems).toHaveCount(
      rootElements.length + subElements.length
    );
  });

  test("Navigates on on item click", async ({ page }) => {
    const name = <string>data.root.children[0];
    const id = "#menu-node-" + name.replaceAll(".", "-");
    const menuItem = page.locator(id);

    await menuItem.click();
    await expect(page).toHaveURL(new RegExp(`\\b${name}\\b`));
    await expectSelected(menuItem);
  });

  test("Preserves expanded items on refresh", async ({ page }) => {
    const lastParent = <string>data.root.children.at(-1);
    const child = (data.elements as any)[lastParent].children[0];

    await page.goto(`/#/${child}?data=example.json`);
    await page.reload();
    await expectExpandedCount(page, 1);
  });
});
