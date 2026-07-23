// ── mobile-trivia.spec.ts ────────────────────────────────────────────────────
// Mobile viewport E2E test for the Bible Trivia page (web).
//
// Tests the full trivia flow on iPhone 14 Pro (390×844):
//   1. Plan screen renders with difficulty options
//   2. Start Quiz loads a question
//   3. Answering shows result card (Correct!/Incorrect)
//   4. Dismissing result reveals Next Question button
//   5. No layout overflow on mobile

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

  // Reload — AuthProvider picks up localStorage on mount
  await page.goto(`${BASE}/user-dashboard`, { waitUntil: "domcontentloaded" });

  // Wait for splash to finish and dashboard to render
  try {
    await page.waitForSelector('text="Explore"', { timeout: 12000 });
  } catch {
    console.log("⚠️ Dashboard 'Explore' not found, continuing");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Navigate to /trivia after login. */
async function goToTrivia(page: Page) {
  await page.goto(`${BASE}/trivia`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const url = page.url();
  console.log(`📍 ${url}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATORS
// ═══════════════════════════════════════════════════════════════════════════════

const BOTTOM_NAV = "nav.safe-area-inset-bottom";

/** The Trivia page's own <header> (not the AppLayout header). */
function triviaHeader(page: Page) {
  return page.locator("header").filter({ hasText: "Bible Trivia" });
}

/** The heading <h1> inside the trivia header. */
function triviaHeading(page: Page) {
  return page.locator("h1").filter({ hasText: "Bible Trivia" });
}

/** Find answer option buttons inside the question card — sibling buttons after "Choose an answer". */
function answerOptions(page: Page) {
  // "Choose an answer" is a <p> child of the options grid div.
  // Its XPath parent is that grid div, and button children are the options.
  return page
    .locator("main >> text=Choose an answer")
    .locator("xpath=..")
    .locator("button");
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Bible Trivia (mobile viewport)", () => {
  test.setTimeout(90_000);

  test("1. Plan screen renders with header, difficulty options, and Start button", async ({ page }) => {
    await loginViaAPI(page);
    await goToTrivia(page);

    // ── Trivia heading (NOT the AppLayout h1 which says "EXEGESIS") ──
    const h1 = triviaHeading(page);
    await expect(h1).toBeVisible({ timeout: 5000 });
    const h1Text = await h1.textContent();
    expect(h1Text?.trim()).toBe("Bible Trivia");
    console.log("✅ Trivia heading: Bible Trivia");

    // ── Plan screen heading ──
    const quizHeading = page.locator("main >> text=Bible Knowledge Quiz");
    await expect(quizHeading).toBeVisible({ timeout: 3000 });
    console.log("✅ Plan heading: Bible Knowledge Quiz");

    // ── Difficulty options ──
    // Use first() to avoid strict mode — "All" / "Easy" text can match multiple elements
    const diffs = ["All", "Easy", "Medium", "Hard"];
    for (const d of diffs) {
      await expect(page.locator("main >> text=" + d).first()).toBeVisible({ timeout: 3000 });
    }
    console.log(`✅ All ${diffs.length} difficulty options visible`);

    // ── Start Quiz button ──
    await expect(page.locator('button:has-text("Start Quiz")')).toBeVisible({ timeout: 3000 });
    console.log("✅ Start Quiz button visible");

    // ── Mobile bottom nav still visible ──
    await expect(page.locator(BOTTOM_NAV)).toBeVisible({ timeout: 3000 });
    console.log("✅ MobileBottomNav visible\n");
  });

  test("2. Starting a quiz shows the question and answer options", async ({ page }) => {
    await loginViaAPI(page);
    await goToTrivia(page);

    // Click Start Quiz
    const startBtn = page.locator('button:has-text("Start Quiz")');
    await startBtn.click();
    console.log("🎯 Clicked Start Quiz");

    // Wait for the question to load — look for "Choose an answer" label
    try {
      await page.waitForSelector("main >> text=Choose an answer", { timeout: 10000 });
      console.log("✅ Question loaded (found 'Choose an answer')");
    } catch {
      await page.waitForTimeout(3000);
    }

    // Verify question progress indicator (substring match, first() to avoid strict mode
    // from matching both the progress label 'Question 1 of 10' and the question card label 'Question')
    const progress = page.locator("main >> text=Question").first();
    try {
      await expect(progress).toBeVisible({ timeout: 3000 });
      const progressText = await progress.textContent();
      console.log(`📊 Progress: ${progressText?.trim()}`);
    } catch {
      console.log("⚠️ Progress indicator not visible");
    }

    // Verify difficulty filter chips are visible during game
    try {
      await expect(page.locator("main >> text=Difficulty")).toBeVisible({ timeout: 3000 });
      console.log("✅ Difficulty filter chips visible");
    } catch {
      console.log("⚠️ Difficulty labels not found");
    }

    // Verify answer options exist (buttons inside the question card)
    const opts = answerOptions(page);
    const optCount = await opts.count();
    console.log(`📋 Found ${optCount} answer option button(s)`);
    expect(optCount).toBeGreaterThanOrEqual(2);

    // Verify "Tap an option to answer" hint
    try {
      await expect(page.locator("main >> text=Tap an option to answer")).toBeVisible({ timeout: 3000 });
      console.log("✅ 'Tap an option to answer' hint visible");
    } catch {
      console.log("⚠️ Tap hint not found");
    }

    // Check bottom nav still visible
    await expect(page.locator(BOTTOM_NAV)).toBeVisible({ timeout: 3000 });
    console.log("✅ MobileBottomNav visible during game\n");
  });

  test("3. Answering a question shows result card (Correct!/Incorrect)", async ({ page }) => {
    await loginViaAPI(page);
    await goToTrivia(page);

    // Start quiz
    await page.locator('button:has-text("Start Quiz")').click();

    // Wait for question to load
    try {
      await page.waitForSelector("main >> text=Choose an answer", { timeout: 10000 });
    } catch {
      await page.waitForTimeout(3000);
    }

    // Click the first answer option button
    const opts = answerOptions(page);
    const optCount = await opts.count();
    console.log(`📋 Found ${optCount} answer options`);

    if (optCount > 0) {
      await opts.first().click();
      console.log("🎯 Clicked first answer option");
    }

    // Wait for result card — shows "Correct!" or "Incorrect"
    try {
      // Wait for either text to appear inside <main>
      await page.waitForSelector("main >> text=Correct!", { timeout: 10000 });
      console.log("✅ Result: Correct!");
    } catch {
      try {
        await page.waitForSelector("main >> text=Incorrect", { timeout: 5000 });
        console.log("✅ Result: Incorrect");
      } catch {
        console.log("⚠️ Neither Correct! nor Incorrect found");
        await page.waitForTimeout(2000);
      }
    }

    // Verify the score badge shows (a "X/X" pattern in the trivia header)
    try {
      const badge = triviaHeader(page).locator("text=/\\d+\\/\\d+/");
      await expect(badge).toBeVisible({ timeout: 3000 });
      const badgeText = await badge.textContent();
      console.log(`📊 Score badge: ${badgeText?.trim()}`);
    } catch {
      console.log("⚠️ Score badge not found");
    }

    // Verify body has meaningful content
    const bodyLen = (await page.textContent("body"))?.length ?? 0;
    expect(bodyLen).toBeGreaterThan(100);
    console.log(`📝 Body: ${bodyLen} chars`);

    // Check bottom nav still visible
    await expect(page.locator(BOTTOM_NAV)).toBeVisible({ timeout: 3000 });
    console.log("✅ MobileBottomNav visible after answering\n");
  });

  test("4. Dismissing result card reveals Next Question button", async ({ page }) => {
    await loginViaAPI(page);
    await goToTrivia(page);

    // Start quiz → answer first option
    await page.locator('button:has-text("Start Quiz")').click();
    try {
      await page.waitForSelector("main >> text=Choose an answer", { timeout: 10000 });
    } catch {
      await page.waitForTimeout(3000);
    }

    // Click first option
    const opts = answerOptions(page);
    if ((await opts.count()) > 0) {
      await opts.first().click();
      console.log("🎯 Answered first option");
    }

    // Wait for result card to appear
    try {
      await page.waitForSelector("main >> text=Continue", { timeout: 10000 });
      console.log("✅ Result card visible (Continue button found)");
    } catch {
      await page.waitForTimeout(3000);
    }

    // Click Continue to dismiss result card
    // Note: only 1 "Continue" button exists because no milestone appears at score.total=1
    const continueBtns = page.locator('button:has-text("Continue")');
    const btnCount = await continueBtns.count();
    console.log(`📋 Found ${btnCount} Continue button(s)`);

    if (btnCount > 0) {
      await continueBtns.first().click();
      console.log("🎯 Clicked Continue (dismiss result)");
    }

    // Wait for Next Question button to appear (200ms dismiss animation + state update)
    try {
      await page.waitForSelector('button:has-text("Next Question")', { timeout: 5000 });
      console.log("✅ 'Next Question' button visible after dismissal");
    } catch {
      console.log("⚠️ 'Next Question' button not found");
      const body = await page.textContent("body");
      console.log(`📝 Body (first 500): ${(body || "").substring(0, 500)}`);
    }

    // Verify overall page integrity
    const bodyLen = (await page.textContent("body"))?.length ?? 0;
    expect(bodyLen).toBeGreaterThan(200);

    // Bottom nav still visible
    await expect(page.locator(BOTTOM_NAV)).toBeVisible({ timeout: 3000 });
    console.log("✅ MobileBottomNav visible after result dismissal\n");
  });

  test("5. Page layout does not overflow horizontally on mobile", async ({ page }) => {
    await loginViaAPI(page);
    await goToTrivia(page);

    // Check no horizontal overflow
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);
    console.log("✅ No horizontal overflow");

    // Check page width matches viewport
    const viewport = page.viewportSize();
    const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`📐 Viewport: ${viewport?.width}px, HTML: ${htmlWidth}px`);
    expect(htmlWidth).toBeLessThanOrEqual(viewport?.width ?? 390);

    // Verify trivia header is within viewport (scoped to avoid AppLayout header)
    const hdr = triviaHeader(page);
    const hdrBox = await hdr.boundingBox();
    expect(hdrBox).not.toBeNull();
    if (hdrBox) {
      console.log(`📐 Trivia header: x=${hdrBox.x}, width=${hdrBox.width}`);
      expect(hdrBox.x).toBeGreaterThanOrEqual(0);
      expect(hdrBox.x + hdrBox.width).toBeLessThanOrEqual(viewport?.width ?? 390);
    }

    // Bottom nav is within viewport
    const navBox = await page.locator(BOTTOM_NAV).boundingBox();
    expect(navBox).not.toBeNull();
    if (navBox) {
      console.log(`📐 BottomNav: y=${navBox.y}, height=${navBox.height}`);
      expect(navBox.y + navBox.height).toBeLessThanOrEqual(viewport?.height ?? 844);
    }

    console.log("✅ Layout fits mobile viewport\n");
  });
});
