// Dev-only: verify the SubscriptionHistorySheet timeline in the browser.
// Requires backend :5001 + vite :8080 and a temp admin session file.
import { launch } from "puppeteer-core";
import { execSync } from "node:child_process";
import fs from "node:fs";

const session = JSON.parse(fs.readFileSync("/tmp/bv-session.json", "utf8"));
const TARGET_EMAIL = process.argv[2] || "opiobonniky@gmail.com";

const chromePath = (() => {
  try {
    return execSync("which google-chrome").toString().trim();
  } catch {
    return "/usr/bin/google-chrome";
  }
})();

const browser = await launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
const pageErrors = [];
page.on("pageerror", (err) => pageErrors.push(err.message));

const payload = JSON.parse(
  Buffer.from(session.token.split(".")[1], "base64").toString(),
);
const userBlob = JSON.stringify({
  id: payload.id,
  username: payload.username,
  email: payload.email,
  userRole: payload.userRole,
  firstName: "Admin",
  lastName: "Verify",
});

await page.evaluateOnNewDocument(
  ([t, u]) => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("theme_mode", "dark");
    localStorage.setItem("auth_token", t);
    localStorage.setItem("user_data", u);
  },
  [session.token, userBlob],
);

await page.goto("http://localhost:8080/admin/subscriptions", {
  waitUntil: "networkidle2",
  timeout: 30000,
});

// Switch to the subscribers tab (Radix activates on mousedown, so use real
// mouse clicks at the element's coordinates, retried until selected).
await page.waitForFunction(
  () => [...document.querySelectorAll("button[role='tab']")].some((el) =>
    /subscribers/i.test(el.textContent || ""),
  ),
  { timeout: 20000 },
);
for (let i = 0; i < 6; i++) {
  const state = await page.evaluate(() => {
    const tab = [...document.querySelectorAll("button[role='tab']")].find((el) =>
      /subscribers/i.test(el.textContent || ""),
    );
    if (!tab) return null;
    if (tab.getAttribute("aria-selected") === "true") return "selected";
    const r = tab.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (state === "selected") break;
  if (state) await page.mouse.click(state.x, state.y);
  await new Promise((r) => setTimeout(r, 800));
}

// Wait for the target row and click its History button.
try {
  await page.waitForFunction(
    (email) =>
      [...document.querySelectorAll("tr")].some((tr) =>
        tr.textContent.includes(email),
      ),
    { timeout: 25000 },
    TARGET_EMAIL,
  );
} catch {
  const state = await page.evaluate(() => ({
    url: location.href,
    tabs: [...document.querySelectorAll("[role='tab']")].map((t) => ({
      label: t.textContent?.trim(),
      selected: t.getAttribute("aria-selected"),
    })),
    text: document.body.innerText.slice(0, 400).replace(/\n+/g, " | "),
  }));
  console.log("ROW NOT FOUND. State:", JSON.stringify(state, null, 2));
  await browser.close();
  process.exit(1);
}
await page.evaluate((email) => {
  const row = [...document.querySelectorAll("tr")].find((tr) =>
    tr.textContent.includes(email),
  );
  const btn = row?.querySelector('button[title="View subscription history"]');
  btn?.click();
}, TARGET_EMAIL);

// Wait for the sheet + timeline items.
try {
  await page.waitForFunction(
    () => document.body.innerText.includes("Subscription history"),
    { timeout: 15000 },
  );
  await page.waitForFunction(
    () =>
      document.body.innerText.includes("No events recorded") ||
      document.querySelectorAll("ol li").length > 0,
    { timeout: 15000 },
  );
} catch {
  const state = await page.evaluate(() => ({
    url: location.href,
    text: document.body.innerText.slice(0, 300).replace(/\n+/g, " | "),
  }));
  console.log("SHEET NOT FOUND. State:", JSON.stringify(state, null, 2));
  await browser.close();
  process.exit(1);
}

const result = await page.evaluate(() => {
  const items = [...document.querySelectorAll("ol li")].map((li) => {
    const label = li.querySelector("p")?.textContent?.trim();
    const badge = li.querySelector("span [class*='capitalize'], [class*='badge']")?.textContent?.trim();
    return `${label}${badge ? ` [${badge}]` : ""}`;
  });
  const sheetText = document.body.innerText;
  return {
    sheetOpen: sheetText.includes("Subscription history"),
    itemCount: items.length,
    items: items.slice(0, 8),
    hasProfileBadges:
      sheetText.includes("renews") || sheetText.includes("legacy_sower"),
  };
});

console.log(JSON.stringify(result, null, 2));
await page.screenshot({ path: "/tmp/subscription-history.png" });

const ok =
  result.sheetOpen &&
  result.itemCount > 0 &&
  pageErrors.length === 0;
console.log(
  ok
    ? "✅ SUBSCRIPTION HISTORY TIMELINE VERIFIED"
    : "❌ TIMELINE CHECK FAILED (see above)",
);
if (pageErrors.length) console.log("PAGE ERRORS:", pageErrors);
await browser.close();
process.exit(ok ? 0 : 1);
