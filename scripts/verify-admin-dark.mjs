// Dev-only: crawl every admin page in DARK mode and flag:
//  - pages that don't go dark (html.dark missing / body stays light)
//  - large light surfaces (slabs > 60% of a viewport that stay near-white)
//  - text on those slabs with poor contrast
// Requires backend :5001 + vite :8080. Usage: node verify-admin-dark.mjs <token>
import { launch } from "puppeteer-core";
import { execSync } from "node:child_process";

const token = process.argv[2];
if (!token) {
  console.error("usage: node verify-admin-dark.mjs <jwt>");
  process.exit(2);
}

const chromePath = (() => {
  try {
    return execSync("which google-chrome").toString().trim();
  } catch {
    return "/usr/bin/google-chrome";
  }
})();

const payload = JSON.parse(
  Buffer.from(token.split(".")[1], "base64").toString(),
);
const userBlob = JSON.stringify({
  id: payload.id,
  username: payload.username,
  email: payload.email,
  userRole: payload.userRole,
  firstName: "Admin",
  lastName: "Verify",
});

const PAGES = [
  "/admin",
  "/admin/users",
  "/admin/users/create",
  "/admin/daily-content",
  "/admin/journal-moderation",
  "/admin/book-prologues",
  "/admin/verse-explanations",
  "/admin/study-tools",
  "/admin/trivia",
  "/admin/subscriptions",
];

const browser = await launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
const pageErrors = [];
page.on("pageerror", (err) => pageErrors.push(`${location}: ${err.message}`));

await page.evaluateOnNewDocument(
  ([t, u]) => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("theme_mode", "dark");
    localStorage.setItem("auth_token", t);
    localStorage.setItem("user_data", u);
  },
  [token, userBlob],
);
await page.emulateMediaFeatures([
  { name: "prefers-color-scheme", value: "dark" },
]);

const results = [];

for (const path of PAGES) {
  try {
    await page.goto(`http://localhost:8080${path}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 1200)); // let lazy content/skeletons settle

    const audit = await page.evaluate(() => {
      const lum = ([r, g, b]) => {
        const f = (c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
      const isDark = (s) => lum(rgb(s)) < 0.25;
      const contrast = (fg, bg) => {
        const l1 = lum(rgb(fg));
        const l2 = lum(rgb(bg));
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      const opaqueBgOf = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const bg = getComputedStyle(n).backgroundColor;
          const m = bg.match(/rgba?\(([^)]+)\)/);
          if (m) {
            const parts = m[1].split(",").map((x) => parseFloat(x));
            const a = parts.length === 4 ? parts[3] : 1;
            if (a > 0.9) return bg;
          }
          n = n.parentElement;
        }
        return "rgb(255,255,255)";
      };

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const vpArea = vh * vw;
      const issues = [];

      // 1) Big near-white opaque slabs (gradient stops count too)
      const seen = new Set();
      for (const el of document.querySelectorAll("div,section,main,header,aside")) {
        const cs = getComputedStyle(el);
        const stops = [];
        if (cs.backgroundColor.startsWith("rgb")) stops.push(cs.backgroundColor);
        const g = cs.backgroundImage.match(/rgb\([^)]+\)/g);
        if (cs.backgroundImage.includes("gradient") && g) stops.push(...g);
        for (const s of stops) {
          const m = s.match(/rgba?\(([^)]+)\)/);
          if (!m) continue;
          const parts = m[1].split(",").map((x) => parseFloat(x));
          const a = parts.length === 4 ? parts[3] : 1;
          if (a < 0.5) continue;
          if (isDark(s)) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 80 || r.height < 80) continue;
          if ((r.width * r.height) / vpArea < 0.2) continue;
          const key = s + Math.round(r.width) + "x" + Math.round(r.height);
          if (seen.has(key)) continue;
          seen.add(key);
          // worst-case text contrast on this light slab
          let worst = Infinity;
          let sample = "";
          for (const t of el.querySelectorAll("h1,h2,h3,p,span")) {
            if (!t.textContent.trim()) continue;
            const c = contrast(getComputedStyle(t).color, s);
            if (c < worst) {
              worst = c;
              sample = t.textContent.trim().slice(0, 30);
            }
          }
          issues.push({
            kind: "light-surface",
            color: s,
            size: `${Math.round(r.width)}x${Math.round(r.height)}`,
            worstTextContrast: +worst.toFixed(2),
            sample,
            cls: (el.className || "").toString().slice(0, 80),
          });
          break; // one representative issue per element
        }
      }

      return {
        htmlDark: document.documentElement.classList.contains("dark"),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        text: document.body.innerText.slice(0, 120).replace(/\n+/g, " | "),
        issues: issues.slice(0, 4),
      };
    });

    results.push({ path, ...audit });
    console.log(
      `\n${path}  dark:${audit.htmlDark ? "✓" : "✗"}  ${audit.text.slice(0, 70)}`,
    );
    for (const i of audit.issues) {
      console.log(
        `   ⚠ ${i.kind} ${i.color} ${i.size} contrast:${i.worstTextContrast} "${i.sample}" [${i.cls}]`,
      );
    }
    if (!audit.issues.length) console.log("   ✓ no light surfaces");
  } catch (e) {
    results.push({ path, error: e.message });
    console.log(`\n${path}  ERROR: ${e.message.slice(0, 120)}`);
  }
}

await page.screenshot({ path: "/tmp/admin-dark-crawl.png" });
const clean = results.filter((r) => !r.error && r.htmlDark && !r.issues.length);
console.log(
  `\n=== ${clean.length}/${PAGES.length} pages fully dark-clean; pageErrors: ${pageErrors.length}`,
);
if (pageErrors.length) console.log(pageErrors.slice(0, 5));
await browser.close();
process.exit(clean.length === PAGES.length && !pageErrors.length ? 0 : 1);
