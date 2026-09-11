// Dev-only: verify the AudioControlBar verse-tick bar renders, tracks the
// verse being read, and seeks on click. Requires backend :5001 + vite :8080.
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
await page.setViewport({ width: 1280, height: 900 });

page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

// Seed the auth session the web app reads from localStorage. The user blob
// is rebuilt from the JWT payload (id/username/email/userRole), which is what
// AuthContext.parse of user_data expects.
const payload = JSON.parse(Buffer.from(session.token.split(".")[1], "base64").toString());
const userBlob = JSON.stringify({
  id: payload.id,
  username: payload.username,
  email: payload.email,
  userRole: payload.userRole,
  firstName: payload.username,
  lastName: "Verify",
});
// Seed localStorage before any app script runs on every navigation — avoids
// the ProtectedRoute redirect racing a post-load localStorage write.
await page.evaluateOnNewDocument(
  ([t, u]) => {
    localStorage.setItem("auth_token", t);
    localStorage.setItem("user_data", u);
    localStorage.setItem(
      "exegesis_book_overview_seen",
      JSON.stringify(["Genesis"]),
    );
  },
  [session.token, userBlob],
);

// Open the reader on Genesis 2 (small chapter, 25 verses — good for ticks).
await page.goto("http://localhost:8080/bible-reader?book=Genesis&chapter=2", {
  waitUntil: "networkidle2",
  timeout: 30000,
});

await page.waitForSelector("p", { timeout: 20000 });
const hasVerses = await page.evaluate(() => document.body.innerText.length > 200);
console.log("reader rendered:", hasVerses);

// Start chapter audio via the header Listen button.
const clicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")];
  const listen = btns.find((b) => (b.textContent || "").trim().toLowerCase().includes("listen"));
  if (listen) { listen.click(); return true; }
  return false;
});
console.log("clicked Listen:", clicked);
if (!clicked) {
  console.log("BODY SNIPPET:", (await page.evaluate(() => document.body.innerText.slice(0, 400))));
  await browser.close();
  process.exit(1);
}

// Wait for the tick bar to appear inside the audio control bar.
await page.waitForSelector('[role="progressbar"][aria-label^="Audio progress"]', {
  timeout: 20000,
});

const readBar = () =>
  page.evaluate(() => {
    const bar = document.querySelector('[role="progressbar"][aria-label^="Audio progress"]');
    if (!bar) return null;
    const ticks = bar.querySelectorAll("span[aria-hidden]");
    const highlighted = document.querySelectorAll(".verse-reading").length;
    const label = bar.getAttribute("aria-label");
    const now = bar.getAttribute("aria-valuenow");
    const max = bar.getAttribute("aria-valuemax");
    // Which tick index is "current" (has the glow shadow)?
    let currentIdx = -1;
    ticks.forEach((t, i) => {
      if (t.className.includes("shadow-")) currentIdx = i;
    });
    return { label, now, max, tickCount: ticks.length, currentIdx, highlighted };
  });

const snap1 = await readBar();
console.log("t0:", JSON.stringify(snap1));

// Wait ~12s of playback and re-read.
await new Promise((r) => setTimeout(r, 12000));
const snap2 = await readBar();
console.log("t+12s:", JSON.stringify(snap2));

// Seek: click ~80% across the track.
const seeked = await page.evaluate(() => {
  const bar = document.querySelector('[role="progressbar"][aria-label^="Audio progress"]');
  if (!bar) return false;
  const rect = bar.getBoundingClientRect();
  const ev = new MouseEvent("click", {
    bubbles: true, cancelable: true, clientX: rect.left + rect.width * 0.8, clientY: rect.top + rect.height / 2,
  });
  bar.dispatchEvent(ev);
  return true;
});
console.log("dispatched seek click:", seeked);

await new Promise((r) => setTimeout(r, 3000));
const snap3 = await readBar();
console.log("after seek:", JSON.stringify(snap3));

const ok =
  snap1 && snap2 && snap3 &&
  snap1.tickCount === 25 &&
  Number(snap2.now) > Number(snap1.now) &&
  Number(snap3.now) >= 18 && snap3.highlighted >= 1;

console.log(ok ? "✅ ALL CHECKS PASSED" : "❌ CHECKS FAILED");
await browser.close();
process.exit(ok ? 0 : 1);
