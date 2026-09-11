// Dev-only: verify the AdminSignupRateCard renders on the admin dashboard with
// month/today/avg values. Requires backend :5001 + vite :8080.
import { launch } from "puppeteer-core";
import { execSync } from "node:child_process";
import fs from "node:fs";

const session = JSON.parse(fs.readFileSync("/tmp/bv-session.json", "utf8"));

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
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

const payload = JSON.parse(Buffer.from(session.token.split(".")[1], "base64").toString());
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
    localStorage.setItem("auth_token", t);
    localStorage.setItem("user_data", u);
  },
  [session.token, userBlob],
);

await page.goto("http://localhost:8080/admin", {
  waitUntil: "networkidle2",
  timeout: 30000,
});

// Wait for the sign-up rate card (innerText reflects CSS uppercasing, so match case-insensitively).
const cardVisible = () =>
  document.body.innerText.toLowerCase().includes("sign-up rate");
try {
  await page.waitForFunction(cardVisible, { timeout: 20000 });
} catch {
  const state = await page.evaluate(() => ({
    url: location.href,
    text: document.body.innerText.slice(0, 400).replace(/\n+/g, " | "),
    hasToken: !!localStorage.getItem("auth_token"),
    hasUser: !!localStorage.getItem("user_data"),
  }));
  console.log("CARD NOT FOUND. Page state:", JSON.stringify(state, null, 2));
  await browser.close();
  process.exit(1);
}

const result = await page.evaluate(() => {
  const body = document.body.innerText;
  // Find the heading, then read the numbers in the section that follows.
  const idx = body.toLowerCase().indexOf("sign-up rate");
  const section = body.slice(idx, idx + 300);
  return {
    label: /sign-up rate/i.test(section),
    month: /(\d+)\s*\n?\s*THIS MONTH/i.test(section),
    today: /(\d+)\s*\n?\s*TODAY/i.test(section),
    avg: /\/ DAY AVG/i.test(section),
    snippet: section.replace(/\n+/g, " | ").slice(0, 220),
  };
});

console.log(JSON.stringify(result, null, 2));

// Screenshot of the stats area for visual confirmation.
await page.screenshot({ path: "/tmp/admin-signup-rate.png", fullPage: false });

const ok = result.label && result.month && result.today && result.avg;
console.log(ok ? "✅ SIGN-UP RATE CARD VERIFIED" : "❌ CHECK FAILED");
await browser.close();
process.exit(ok ? 0 : 1);
