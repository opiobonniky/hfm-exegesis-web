import { test, expect, type Page } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const FREE_USER = { username: "testlabuser", password: "Password123!" };
const PREMIUM_USER = { username: "premiumtest", password: "Password123!" };

/** Navigate to /login, fill credentials, submit, and wait for redirect to dashboard. */
async function loginAs(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.waitForSelector('input[type="text"], input[name="username"], input[placeholder*="username" i], input[placeholder*="email" i]', { timeout: 10_000 });
  // Find username/email input
  const usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="username" i], input[placeholder*="email" i]').first();
  await usernameInput.fill(username);
  // Find password input
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(password);
  // Click submit button
  await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first().click();
  // Wait for dashboard to load
  await page.waitForURL(/dashboard|user-dashboard/, { timeout: 15_000 });
}

/** Navigate to the app origin first, then clear localStorage and redirect to login. */
async function logoutAndClear(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[type="password"]', { timeout: 10_000 });
  // Now on the app origin, localStorage is accessible
  await page.evaluate(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  });
}

/** Check that a "Become a Sower" or "Unlock" button is visible (gating active). */
async function expectGated(page: Page) {
  const badge = page.locator('button:has-text("Become a Sower")').or(
    page.locator('button:has-text("Unlock")'),
  ).first();
  await expect(badge).toBeVisible({ timeout: 10_000 });
}

/** Check that NO gating buttons are present (feature is unlocked). */
async function expectNotGated(page: Page) {
  await page.waitForLoadState("networkidle");
  const lockButtons = page.locator('button:has-text("Become a Sower")');
  const unlockButtons = page.locator('button:has-text("Unlock")');
  await expect(lockButtons).toHaveCount(0, { timeout: 5_000 });
  await expect(unlockButtons).toHaveCount(0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS — FREE USER
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Free User — subscription gating", () => {
  test.beforeEach(async ({ page }) => {
    await logoutAndClear(page);
    await loginAs(page, FREE_USER.username, FREE_USER.password);
  });

  test("Journal / Legacy Ledger shows LockedFeatureBadge", async ({ page }) => {
    await page.goto("/journal");
    // Wait for either the page title or gating badge to appear
    await page.waitForSelector("h1, button:has-text('Become a Sower')", { timeout: 10_000 });
    await expectGated(page);
  });

  test("Exegesis Lab home shows LockedFeatureBadge", async ({ page }) => {
    await page.goto("/lab");
    await page.waitForSelector("h1, button:has-text('Become a Sower')", { timeout: 10_000 });
    await expectGated(page);
  });

  test("Search Strong's scope shows LockedFeatureBadge", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    // Click Strong's scope tab
    const strongsTab = page.getByRole("button").filter({ hasText: /Strong/i });
    await strongsTab.first().click();
    await page.waitForTimeout(800);
    // Now the LockedFeatureBadge should appear with "Become a Sower"
    await expectGated(page);
  });

  test("Sidebar shows Free Reader tier badge", async ({ page }) => {
    await page.goto("/user-dashboard");
    // The sidebar should have a tier badge showing "Free Reader"
    // This might be in the sidebar footer
    const tierBadge = page.locator("text=Free Reader").first();
    await expect(tierBadge).toBeVisible({ timeout: 5_000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS — PREMIUM USER
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Premium User (legacy_sower) — all features unlocked", () => {
  test.beforeEach(async ({ page }) => {
    await logoutAndClear(page);
    await loginAs(page, PREMIUM_USER.username, PREMIUM_USER.password);
  });

  test("Journal / Legacy Ledger loads without gating", async ({ page }) => {
    await page.goto("/journal");
    await expect(page.locator("h1").filter({ hasText: "Legacy Ledger" }).first()).toBeVisible({ timeout: 10_000 });
    await expectNotGated(page);
  });

  test("Exegesis Lab home loads without gating", async ({ page }) => {
    await page.goto("/lab");
    // Wait for the Lab page content to render
    await page.waitForSelector("h1", { timeout: 10_000 });
    await page.waitForLoadState("networkidle");
    await expectNotGated(page);
  });

  test("Search Strong's scope works without gating", async ({ page }) => {
    await page.goto("/search");
    // Click Strong's scope tab
    const strongsTab = page.locator("button").filter({ hasText: /Strong/ }).first();
    if (await strongsTab.isVisible()) {
      await strongsTab.click();
      await page.waitForTimeout(500);
    }
    // For premium users, no lock badge should appear
    await expectNotGated(page);
  });

  test("Sidebar shows Legacy Sower tier badge", async ({ page }) => {
    await page.goto("/user-dashboard");
    const tierBadge = page.locator("text=Legacy Sower").first();
    await expect(tierBadge).toBeVisible({ timeout: 5_000 });
  });
});
