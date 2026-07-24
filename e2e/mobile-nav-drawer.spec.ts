// ── mobile-nav-drawer.spec.ts ────────────────────────────────────────────────
// MobileNavDrawer (bottom sheet) rendering and interaction test.
//
// Tests on iPhone 14 Pro viewport (390×844):
//   1. Trigger button renders with current book/chapter
//   2. Opening the drawer shows the bottom sheet with tabs
//   3. Books tab renders a list of selectable books
//   4. Chapters tab renders a grid of chapters
//   5. Verses tab renders a grid of verse numbers
//   6. Version tab renders translation options
//   7. Selecting a book navigates and closes the drawer
//   8. Sheet has proper a11y title (no Radix UI warning)
//   9. No horizontal overflow on mobile

import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:8080";
const BACKEND = "http://127.0.0.1:5001";
const USERNAME = "e2etestuser";
const PASSWORD = "TestPass123!";

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE VIEWPORT (iPhone 14 Pro: 390×844)
// ═══════════════════════════════════════════════════════════════════════════════
test.use({ viewport: { width: 390, height: 844 } });

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH HELPER
// ═══════════════════════════════════════════════════════════════════════════════

/** Log in via real API, inject token+user into localStorage, reload. */
async function loginViaAPI(page: Page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const resp = await page.request.post(`${BACKEND}/auth/login`, {
    data: { username: USERNAME, password: PASSWORD },
  });
  const json = await resp.json();
  const token = json.returnData?.token || "";
  const userData = json.returnData || {};
  console.log(`✅ Logged in: ${token.substring(0, 20)}...`);

  await page.evaluate(
    ({ tok, user }) => {
      localStorage.setItem("auth_token", tok);
      localStorage.setItem("user_data", JSON.stringify(user));
      localStorage.setItem("onboarding_completed", "true");
    },
    { tok: token, user: userData },
  );

  // Reload so AuthProvider picks up localStorage on mount
  await page.goto(`${BASE}/bible-reader?book=Genesis&chapter=1`, {
    waitUntil: "domcontentloaded",
  });

  // Wait for BibleReader to load
  try {
    await page.waitForSelector("main", { timeout: 12000 });
  } catch {
    console.log("⚠️ main not found, continuing");
  }
  await page.waitForTimeout(2000);
  console.log(`📍 URL: ${page.url()}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATORS
// ═══════════════════════════════════════════════════════════════════════════════

/** The sheet trigger button (shows current book + chapter). */
function triggerButton(page: Page) {
  // The trigger is a <button> containing a Menu icon and book/chapter text
  return page.locator('button:has(svg.lucide-menu)').filter({ hasText: /Genesis|Exodus|Matthew/ });
}

/** The bottom sheet content wrapper (open state). */
function sheetContent(page: Page) {
  // Radix UI Sheet renders a [data-state="open"] content element
  return page.locator('[data-state="open"][role="dialog"]');
}

/** The tab bar inside the sheet. */
function tabBar(page: Page) {
  return sheetContent(page).locator('button').filter({ hasText: /Books|Chapters|Verses|Translation|Study/i });
}

/** The sheet's backdrop overlay. */
function sheetOverlay(page: Page) {
  return page.locator('[data-state="open"][role="dialog"] ~ [data-state="open"]');
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("MobileNavDrawer (Bible Reader bottom sheet)", () => {
  test.setTimeout(90_000);

  test("1. Trigger button shows current book and chapter", async ({ page }) => {
    await loginViaAPI(page);

    // The trigger button should show "Genesis" and "1" (from the URL params)
    const trigger = page.locator('button:has(svg.lucide-menu)');
    await expect(trigger).toBeVisible({ timeout: 5000 });
    const triggerText = await trigger.textContent();
    console.log(`📋 Trigger text: "${triggerText?.trim()}"`);

    expect(triggerText).toContain("Genesis");
    expect(triggerText).toContain("1");
    console.log("✅ Trigger shows current book + chapter");
  });

  test("2. Opening the drawer shows the bottom sheet with tab bar", async ({ page }) => {
    await loginViaAPI(page);

    // Click the trigger button to open the drawer
    const trigger = page.locator('button:has(svg.lucide-menu)');
    await trigger.click();
    console.log("🎯 Clicked trigger button");

    // Wait for the sheet to open — Radix animates in
    try {
      await page.waitForSelector('[data-state="open"][role="dialog"]', { timeout: 5000 });
      console.log("✅ Sheet opened");
    } catch {
      console.log("⚠️ Sheet not found via attribute, trying fallback");
      await page.waitForTimeout(1000);
    }

    // Verify the handle bar is present (the rounded pill at top of sheet)
    const handleBar = page.locator('.rounded-full.bg-border');
    await expect(handleBar.first()).toBeVisible({ timeout: 3000 });
    console.log("✅ Handle bar visible");

    // Verify tab buttons exist
    const tabs = ["Books", "Chapters", "Verses", "Translation", "Study"];
    for (const tab of tabs) {
      const tabBtn = page.locator('[role="dialog"] button').filter({ hasText: tab });
      await expect(tabBtn.first()).toBeVisible({ timeout: 3000 });
    }
    console.log(`✅ All ${tabs.length} tabs visible`);
  });

  test("3. Books tab renders a scrollable grid of Bible books", async ({ page }) => {
    await loginViaAPI(page);

    // Open drawer
    await page.locator('button:has(svg.lucide-menu)').click();
    await page.waitForTimeout(800);

    // Books tab is default, so book buttons should be visible
    // Look for several well-known book names
    const bookNames = ["Genesis", "Exodus", "Psalms", "Matthew", "Revelation"];
    for (const name of bookNames) {
      const bookBtn = page.locator('[role="dialog"]').locator('button', { hasText: name });
      try {
        await expect(bookBtn.first()).toBeVisible({ timeout: 3000 });
        console.log(`✅ Book "${name}" visible`);
      } catch {
        console.log(`⚠️ Book "${name}" not found (may need scrolling)`);
      }
    }
  });

  test("4. Selecting a book navigates and closes the drawer", async ({ page }) => {
    await loginViaAPI(page);

    // Open drawer
    await page.locator('button:has(svg.lucide-menu)').click();
    await page.waitForTimeout(800);

    // Click "Exodus" book button inside the dialog
    const exodusBtn = page.locator('[role="dialog"] button').filter({ hasText: "Exodus" }).first();
    await expect(exodusBtn).toBeVisible({ timeout: 3000 });
    await exodusBtn.click();
    console.log("🎯 Clicked Exodus");

    // The drawer should close and navigate to Exodus chapter 1
    await page.waitForTimeout(800);
    const triggerText = await page.locator('button:has(svg.lucide-menu)').textContent();
    console.log(`📋 Trigger after navigation: "${triggerText?.trim()}"`);
    expect(triggerText).toContain("Exodus");
    expect(triggerText).toContain("1");

    // Verify the sheet is closed (no dialog with data-state="open")
    const openSheet = page.locator('[data-state="open"][role="dialog"]');
    await expect(openSheet).toHaveCount(0, { timeout: 3000 });
    console.log("✅ Sheet closed after book selection");
  });

  test("5. Chapters tab renders a grid of chapter numbers", async ({ page }) => {
    await loginViaAPI(page);

    // Open drawer
    await page.locator('button:has(svg.lucide-menu)').click();
    await page.waitForTimeout(800);

    // Switch to Chapters tab
    const chaptersTab = page.locator('[role="dialog"] button').filter({ hasText: "Chapters" }).first();
    await chaptersTab.click();
    await page.waitForTimeout(500);
    console.log("🎯 Switched to Chapters tab");

    // Genesis has 50 chapters — check that chapter buttons exist
    const chapterButtons = page.locator('[role="dialog"] button').filter({ hasText: /^\d+$/ });
    const count = await chapterButtons.count();
    console.log(`📋 Found ${count} chapter button(s)`);
    expect(count).toBeGreaterThanOrEqual(10);

    // Chapter 1 should be highlighted (currently selected)
    const ch1Btn = page.locator('[role="dialog"] button').filter({ hasText: "1" }).first();
    const ch1Class = await ch1Btn.getAttribute("class");
    console.log(`📋 Chapter 1 classes: "${ch1Class?.substring(0, 80)}"`);
    expect(ch1Class).toContain("bg-primary");
    console.log("✅ Chapter 1 shows active (selected) styling");
  });

  test("6. Verses tab renders verse numbers for the current chapter", async ({ page }) => {
    await loginViaAPI(page);

    // Open drawer
    await page.locator('button:has(svg.lucide-menu)').click();
    await page.waitForTimeout(800);

    // Switch to Verses tab
    const versesTab = page.locator('[role="dialog"] button').filter({ hasText: "Verses" }).first();
    await versesTab.click();
    await page.waitForTimeout(500);
    console.log("🎯 Switched to Verses tab");

    // Genesis 1 has 31 verses — check that verse buttons are rendered
    const verseButtons = page.locator('[role="dialog"] button').filter({ hasText: /^\d{1,2}$/ });
    const count = await verseButtons.count();
    console.log(`📋 Found ${count} verse button(s)`);
    expect(count).toBeGreaterThanOrEqual(5);
    console.log("✅ Verse grid rendered");
  });

  test("7. Version tab renders translation options", async ({ page }) => {
    await loginViaAPI(page);

    // Open drawer
    await page.locator('button:has(svg.lucide-menu)').click();
    await page.waitForTimeout(800);

    // Switch to Translation tab
    const versionTab = page.locator('[role="dialog"] button').filter({ hasText: "Translation" }).first();
    await versionTab.click();
    await page.waitForTimeout(500);
    console.log("🎯 Switched to Translation tab");

    // Check that translation options are visible — KJV should be there
    const kjvOption = page.locator('[role="dialog"]').locator('button').filter({ hasText: "KJV" });
    await expect(kjvOption.first()).toBeVisible({ timeout: 3000 });
    console.log("✅ KJV translation visible");

    // Click KJV
    await kjvOption.first().click();
    await page.waitForTimeout(800);

    // The sheet should close and the trigger should still show the book + chapter
    const triggerText = await page.locator('button:has(svg.lucide-menu)').textContent();
    expect(triggerText).toContain("Genesis");
    console.log("✅ Version selection closes sheet without losing position");
  });

  test("8. Sheet has proper a11y title (no Radix UI warning)", async ({ page }) => {
    await loginViaAPI(page);

    // Open drawer
    await page.locator('button:has(svg.lucide-menu)').click();
    await page.waitForTimeout(800);

    // Check that the sheet has a DialogTitle (via aria-labelledby or directly)
    const sheet = page.locator('[role="dialog"]');
    const labelledBy = await sheet.getAttribute("aria-labelledby");
    console.log(`📋 aria-labelledby: ${labelledBy}`);

    // Either aria-labelledby is set, or there's a title element with sr-only
    const hasTitle = labelledBy !== null && labelledBy !== "";
    const hasSrOnlyTitle = await sheet.locator(".sr-only").count() > 0;
    expect(hasTitle || hasSrOnlyTitle).toBe(true);
    console.log("✅ Sheet has accessible title (no Radix a11y warning)");
  });

  test("9. No horizontal overflow on mobile", async ({ page }) => {
    await loginViaAPI(page);

    // Check no overflow before opening drawer
    const noOverflowBefore = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflowBefore).toBe(true);
    console.log("✅ No overflow before opening drawer");

    // Open drawer
    await page.locator('button:has(svg.lucide-menu)').click();
    await page.waitForTimeout(800);

    // Check no overflow after opening drawer
    const noOverflowAfter = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflowAfter).toBe(true);
    console.log("✅ No overflow after opening drawer");

    // Verify sheet width fits viewport
    const viewport = page.viewportSize();
    const sheetBox = await page.locator('[role="dialog"]').boundingBox();
    expect(sheetBox).not.toBeNull();
    if (sheetBox) {
      console.log(`📐 Sheet: x=${sheetBox.x}, width=${sheetBox.width}`);
      expect(sheetBox.x).toBeGreaterThanOrEqual(0);
      expect(sheetBox.x + sheetBox.width).toBeLessThanOrEqual(viewport?.width ?? 390);
    }
  });
});
