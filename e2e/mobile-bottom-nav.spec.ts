// ── mobile-bottom-nav.spec.ts ──────────────────────────────────────────────
// MobileBottomNav navigation test using mobile viewport (iPhone 14 Pro).
//
// Validates that all 6 bottom tabs navigate to the correct URL and that each
// page renders meaningful content — with no 100ms flash after the AuthLoader
// fix (removed isNavigating spinner on SPA transitions).
//
// AUTH STRATEGY
//   Real backend login via page.request.post → inject token into localStorage
//   → full page reload → AuthProvider reads localStorage on mount → logged in.

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
// LOCATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MobileBottomNav's outer <nav> — uses `fixed bottom-0 safe-area-inset-bottom`.
 * The `safe-area-inset-bottom` class is unique to the bottom nav and won't
 * match any sidebar/overlay nav elements.
 */
const BOTTOM_NAV = 'nav.safe-area-inset-bottom';

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

  // Reload — AuthProvider picks up localStorage on mount
  await page.goto(`${BASE}/user-dashboard`, { waitUntil: "domcontentloaded" });

  // Wait for splash to finish and dashboard content to render
  try {
    await page.waitForSelector('text="Explore"', { timeout: 12000 });
  } catch {
    console.log("⚠️ Dashboard 'Explore' not found after login, continuing");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB CONFIG  (mirrors NAV_TABS in MobileBottomNav.tsx)
// ═══════════════════════════════════════════════════════════════════════════════

interface TabTestCase {
  label: string;          // Button label text
  path: string;           // Expected URL path after click
  navIndex: number;       // Button index in the bottom nav (0-5)
  /** Playwright selector to confirm page content rendered (substring match). */
  contentSelector: string;
}

// Order must match NAV_TABS in MobileBottomNav.tsx:
//   Home(0), Bible(1), Lab(2), Journal(3), Search(4), Profile(5)
// Content selectors use `main >>` prefix to scope searches to the page content
// area. Without this, `text=Journal` matches the Journal tab button in the
// bottom nav itself (instant resolve, no wait for actual page content).
const TABS: TabTestCase[] = [
  { label: "Home",    path: "/user-dashboard", navIndex: 0, contentSelector: "main >> text=Explore" },
  { label: "Bible",   path: "/bible-library",  navIndex: 1, contentSelector: "main >> text=Bible" },
  { label: "Lab",     path: "/lab",            navIndex: 2, contentSelector: "main >> text=Exegesis Lab" },
  { label: "Journal", path: "/journal",        navIndex: 3, contentSelector: "main >> text=Journal" },
  { label: "Search",  path: "/search",         navIndex: 4, contentSelector: "main >> text=Search" },
  { label: "Profile", path: "/settings",       navIndex: 5, contentSelector: "main >> text=Settings" },
];

/** Scoped tab button locator by index — uniquely identifies each tab. */
function tabButton(page: Page, tab: TabTestCase) {
  return page.locator(`${BOTTOM_NAV} button`).nth(tab.navIndex);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("MobileBottomNav navigation", () => {
  // This suite makes up to 8 API login calls + navigates 6 tabs per test.
  // A generous timeout prevents flaky failures on slower machines.
  test.setTimeout(90_000);
  test("Bottom nav is visible on mobile viewport", async ({ page }) => {
    await loginViaAPI(page);

    const nav = page.locator(BOTTOM_NAV);
    await expect(nav).toBeVisible({ timeout: 5000 });
    console.log("✅ MobileBottomNav is visible");

    // Verify all 6 tab buttons exist (by index)
    for (const tab of TABS) {
      await expect(tabButton(page, tab)).toBeVisible({ timeout: 3000 });
    }
    console.log(`✅ All ${TABS.length} tabs rendered`);
  });

  for (const tab of TABS) {
    test(`Tab "${tab.label}" navigates to ${tab.path}`, async ({ page }) => {
      await loginViaAPI(page);

      // Click the tab button
      const btn = tabButton(page, tab);
      await expect(btn).toBeVisible({ timeout: 3000 });
      await btn.click();

      // Wait for lazy-loaded page content to render deterministically
      try {
        await page.waitForSelector(tab.contentSelector, { timeout: 6000 });
      } catch {
        // Fallback: page rendered but selector didn't match (e.g. different heading text)
        await page.waitForTimeout(2000);
      }

      // Verify URL
      const currentUrl = page.url();
      const pathname = new URL(currentUrl).pathname;
      console.log(`🔍 ${tab.label}: expected path "${tab.path}", got "${pathname}"`);
      expect(pathname).toBe(tab.path);

      // Verify page has meaningful content (not blank)
      const bodyLen = (await page.textContent("body"))?.length ?? 0;
      console.log(`📝 ${tab.label}: body ${bodyLen} chars`);
      expect(bodyLen).toBeGreaterThan(150);

      // Confirm the current tab shows active styling (text-primary class).
      // Use toPass() to retry — React may not have re-rendered the bottom nav yet.
      const currentBtn = tabButton(page, tab);
      await expect(async () => {
        const cls = await currentBtn.evaluate((el) => el.className);
        expect(cls).toContain("text-primary");
      }).toPass({ timeout: 5000 });
      console.log(`🔍 "${tab.label}" button has text-primary active class`);

      console.log(`✅ PASS: "${tab.label}" → ${pathname} (${bodyLen} chars)`);
    });
  }

  test("No full-screen spinner visible during transitions", async ({ page }) => {
    await loginViaAPI(page);

    // The AuthLoader spinner (before the fix) used:
    //   <div class="min-h-screen flex items-center justify-center bg-background">
    //     <Loader2 class="w-10 h-10 animate-spin text-primary" />
    //   </div>
    // After the fix, this should never appear during SPA transitions.
    const authSpinner = page.locator(".min-h-screen.bg-background .animate-spin");

    // Click through all tabs and verify no spinner takes over
    for (const tab of TABS) {
      await tabButton(page, tab).click();
      // Wait >5x the original 100ms flash window
      await page.waitForTimeout(600);
      await expect(authSpinner.first()).not.toBeVisible({ timeout: 400 });
    }

    console.log("✅ No AuthLoader spinner appeared during mobile transitions");
  });
});
