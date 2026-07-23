// ── test-nav-redirect.spec.ts ──────────────────────────────────────────────
// Verify that the SplashScreen no longer hijacks navigation to /user-dashboard.
//
// After the fix: authenticated users should be able to navigate to any page
// (e.g. /journal, /search, /bible-reader, /settings) and stay on that page
// instead of being redirected to /user-dashboard.

import { test, expect } from "@playwright/test";

const BASE = "http://localhost:8080";
const BACKEND = "http://127.0.0.1:5001";
const USERNAME = "e2etestuser";
const PASSWORD = "TestPass123!";

/**
 * Log in via the real backend API, inject the token + user data into
 * localStorage, then do a full page reload so AuthProvider picks it up.
 * Returns once the dashboard (identified by "Explore" selector) has rendered.
 */
async function loginAndWait(page: any, targetUrl: string) {
  // 1. Navigate to the target URL — splash shows while auth loads
  await page.goto(`${BASE}${targetUrl}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  // 2. Log in via real backend API
  const resp = await page.request.post(`${BACKEND}/auth/login`, {
    data: { username: USERNAME, password: PASSWORD },
  });
  const json = await resp.json();
  const token = json.returnData?.token || "";
  const userData = json.returnData || {};
  console.log(`✅ Logged in: ${token.substring(0, 20)}...`);

  // 3. Inject auth data into localStorage
  await page.evaluate(
    ({ tok, user }) => {
      localStorage.setItem("auth_token", tok);
      localStorage.setItem("user_data", JSON.stringify(user));
      localStorage.setItem("onboarding_completed", "true");
    },
    { tok: token, user: userData }
  );

  // 4. Full page reload to the SAME target URL — AuthProvider picks up localStorage
  await page.goto(`${BASE}${targetUrl}`, { waitUntil: "domcontentloaded" });
  console.log(`📍 Reloaded at ${page.url()}`);

  // 5. Wait for splash to finish and content to load
  //    The splash shows for ~2s after auth resolves. After the fix,
  //    it just dismisses without navigating away, so we stay on targetUrl.
  await page.waitForTimeout(4000);
  console.log(`📍 Post-splash URL: ${page.url()}`);
}

const TEST_PAGES = [
  { path: "/journal",        label: "Journal" },
  { path: "/search",         label: "Search" },
  { path: "/bible-reader",   label: "Bible Reader" },
  { path: "/settings",       label: "Settings" },
  { path: "/user-daily-verse", label: "User Daily Verse" },
  { path: "/my-activity",    label: "My Activity" },
  { path: "/my-reading-plans", label: "My Reading Plans" },
  { path: "/lab",            label: "Lab Home" },
  { path: "/trivia",         label: "Trivia" },
  { path: "/user-devotions", label: "User Devotions" },
];

test.describe("Navigation: no redirect to /user-dashboard after splash", () => {
  for (const { path, label } of TEST_PAGES) {
    test(`Navigating to ${path} (${label}) stays on the page`, async ({ page }) => {
      await loginAndWait(page, path);

      const currentUrl = page.url();
      const pathname = new URL(currentUrl).pathname;

      console.log(`🔍 Expected: ${path}`);
      console.log(`🔍 Actual:   ${pathname}`);

      // The fix: after splash, we should still be on the same page
      expect(pathname).toBe(path);

      // Also verify the body is substantial (not a blank page)
      const bodyLen = (await page.textContent("body"))?.length ?? 0;
      console.log(`📝 Body: ${bodyLen} chars`);
      expect(bodyLen).toBeGreaterThan(100);

      console.log(`✅ PASS: ${path} stays on ${path} (not redirected)`);
    });
  }
});
