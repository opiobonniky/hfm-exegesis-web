// Dev-only Playwright check: dock bar strip + highlight dialog contrast in dark mode.
// Verifies the ReaderDock bars (BottomActionBar, VerseMultiSelectBar, AudioControlBar)
// and the MultiSelectHighlightDialog share consistent, WCAG-AA-passing surfaces.
//
// Requires: backend on :5001, vite on :8080 (or BASE env). Login via admin@gmail.com.
// Usage: node scripts/verify-dock-contrast.mjs [--base URL]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 ? args[baseIdx + 1] : process.env.BASE || 'http://localhost:8080';
const results = [];

function log(step, ok, detail = '') {
  results.push({ step, ok });
  console.log(`${ok ? '✅' : '❌'} ${step}${detail ? ' — ' + detail : ''}`);
}

// ── WCAG math ────────────────────────────────────────────────────────────────
function luminance([r, g, b]) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
function parseRgba(str) {
  const m = str && str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(',').map((s) => parseFloat(s.trim()));
  return { rgb: [r, g, b], a };
}
function over(fg, bg) {
  return fg.rgb.map((c, i) => Math.round(c * fg.a + bg.rgb[i] * (1 - fg.a)));
}

const browser = await chromium.launch();
const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 390, height: 844 } });
const page = await context.newPage();

try {
  await page.addInitScript(() => localStorage.setItem('theme_mode', 'dark'));

  // ── Login (with retries) ───────────────────────────────────────────────────
  await page.goto(`${BASE}/login`);
  let loggedIn = false;
  for (let attempt = 1; attempt <= 5 && !loggedIn; attempt++) {
    await page.getByLabel(/email/i).fill('admin@gmail.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    try {
      await page.waitForURL((u) => !/login/.test(u.pathname), { timeout: 10000 });
      loggedIn = true;
    } catch {
      await page.goto(`${BASE}/login`);
      await page.waitForTimeout(2000);
    }
  }
  log('Login', loggedIn);

  // ── Reader (first-read book-overview gate) ────────────────────────────────
  await page.goto(`${BASE}/bible-reader?book=Genesis&chapter=1`);
  try {
    await page.waitForURL(/book-overview/, { timeout: 8000 });
    await page.getByRole('button', { name: 'Continue to Reader' }).click();
    await page.waitForURL(/bible-reader/, { timeout: 10000 });
  } catch { /* already on reader */ }

  await page.waitForSelector('div.font-serif span.group', { timeout: 30000 });
  const verseCount = await page.locator('div.font-serif span.group').count();
  log('Verses mounted', verseCount > 20, `${verseCount} verses`);

  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  log('Dark theme active', isDark);

  // ReaderDock wrapper is uniquely .z-20.shrink-0 (verse toolbars are absolute z-20 without shrink-0)
  const readDock = () =>
    page.evaluate(() => {
      const wrap = document.querySelector('.z-20.shrink-0');
      const strip = wrap && wrap.querySelector(':scope > div');
      if (!strip) return null;
      const r = strip.getBoundingClientRect();
      return {
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        stripBg: getComputedStyle(strip).backgroundColor,
      };
    });

  // ── State 1: bottom nav ────────────────────────────────────────────────────
  const s1 = await readDock();
  log('BottomActionBar docked', !!s1 && s1.rect.h >= 40 && s1.rect.h <= 56, JSON.stringify(s1?.rect ?? null));
  log('Strip is bg/95 token', !!s1 && /0\.95/.test(s1.stripBg ?? ''), s1?.stripBg);

  // ── State 2: multi-select ──────────────────────────────────────────────────
  await page.locator('div.font-serif span.group').first().click();
  await page.locator('div.font-serif span.group').nth(1).click();
  await page.waitForTimeout(400);
  const s2 = await readDock();
  log('VerseMultiSelectBar docked', !!s2 && s2.rect.h >= 36, JSON.stringify(s2?.rect ?? null));
  log(
    'States 1&2 strip identical',
    !!s1 && !!s2 && s1.stripBg === s2.stripBg && s1.rect.x === s2.rect.x && s1.rect.w === s2.rect.w,
    `${s1?.stripBg} vs ${s2?.stripBg}`,
  );

  // ── Multi-select highlight dialog (dark mode) ─────────────────────────────
  await page.locator('.z-20.shrink-0 button[aria-label="Highlight"]').click();
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  const dialogInfo = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return null;
    const r = dlg.getBoundingClientRect();
    const cs = getComputedStyle(dlg);
    // Find the remove + cancel buttons in the footer row
    const buttons = [...dlg.querySelectorAll('button')];
    const removeBtn = buttons.find((b) => (b.getAttribute('aria-label') || '').startsWith('Remove') || /remove highlight/i.test(b.textContent ?? ''));
    const cancelBtn = buttons.find((b) => (b.getAttribute('aria-label') || '').startsWith('Cancel') || /cancel/i.test(b.textContent ?? ''));
    const swatches = [...dlg.querySelectorAll('button[style*="background"]')];
    return {
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      bg: cs.backgroundColor,
      buttonBg: removeBtn ? getComputedStyle(removeBtn).backgroundColor : null,
      buttonColor: removeBtn ? getComputedStyle(removeBtn).color : null,
      cancelBg: cancelBtn ? getComputedStyle(cancelBtn).backgroundColor : null,
      cancelColor: cancelBtn ? getComputedStyle(cancelBtn).color : null,
      swatchCount: swatches.length,
      fitsViewport: r.width <= window.innerWidth && r.height <= window.innerHeight,
      aboveBottomNav: r.bottom <= window.innerHeight,
    };
  });

  log('Highlight dialog opens', !!dialogInfo, JSON.stringify(dialogInfo?.rect ?? null));
  log('Dialog fits mobile viewport', !!dialogInfo?.fitsViewport && !!dialogInfo?.aboveBottomNav);
  log('All 15 swatches present', dialogInfo?.swatchCount === 15, `${dialogInfo?.swatchCount} swatches`);

  // Dialog surface: bg-popover (opaque) vs foreground text — straight WCAG ratio
  const dlgBg = parseRgba(dialogInfo?.bg);
  const dlgFg = parseRgba(dialogInfo?.buttonColor);
  if (dlgBg && dlgFg) {
    const ratio = contrast(dlgBg.rgb, dlgFg.rgb);
    log('Dialog surface vs muted text ≥ 4.5 (AA)', ratio >= 4.5, `${ratio.toFixed(2)}:1`);
  } else {
    log('Dialog contrast computable', false, 'missing dialog color samples');
  }

  // Remove button surface (bg transparent + border) vs dialog popover bg
  const removeBg = parseRgba(dialogInfo?.buttonBg);
  if (dlgBg && removeBg && removeBg.a < 1) {
    const compositedRemove = over(removeBg, dlgBg);
    const fg = parseRgba(dialogInfo?.buttonColor);
    const ratio = fg ? contrast(compositedRemove, fg.rgb) : 0;
    log('Remove button vs dialog ≥ 4.5 (AA)', ratio >= 4.5, `${ratio.toFixed(2)}:1`);
  } else if (dlgBg && removeBg) {
    const fg = parseRgba(dialogInfo?.buttonColor);
    const ratio = fg ? contrast(removeBg.rgb, fg.rgb) : 0;
    log('Remove button vs dialog ≥ 4.5 (AA)', ratio >= 4.5, `${ratio.toFixed(2)}:1`);
  }

  // Close the dialog, clear the selection
  await page.locator('[role="dialog"] button[aria-label="Cancel"]').click();
  await page.waitForTimeout(200);
  await page.locator('.z-20.shrink-0 button[aria-label="Close"]').click();
  await page.waitForTimeout(300);

  // ── State 3: audio ─────────────────────────────────────────────────────────
  await page.locator('.z-20.shrink-0 button[aria-label*="ead"], .z-20.shrink-0 button[aria-label*="udio"]').first().click();
  await page.waitForTimeout(1500);
  const s3 = await readDock();
  log('AudioControlBar docked', !!s3 && s3.rect.w > 200, JSON.stringify(s3?.rect ?? null));
  log(
    'States 2&3 strip identical',
    !!s2 && !!s3 && s2.stripBg === s3.stripBg,
    `${s2?.stripBg} vs ${s3?.stripBg}`,
  );

  // Safe-area strip (audio bar has one on mobile)
  const safeStrip = await page.evaluate(() => {
    const el = document.querySelector('.z-20.shrink-0 .sm\\:hidden');
    return el ? getComputedStyle(el).backgroundColor : null;
  });
  log(
    'Safe-area strip matches main strip',
    !!safeStrip && safeStrip === s3?.stripBg,
    `${safeStrip} vs ${s3?.stripBg}`,
  );

  // ── Dock strip WCAG contrast (composited over dark page bg) ───────────────
  const stripRgba = parseRgba(s1?.stripBg);
  const darkPageBg = parseRgba(
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) ?? 'rgb(12,14,22)',
  );
  const fg = parseRgba(
    (await page.evaluate(() => getComputedStyle(document.body).color)) ?? 'rgb(221,228,240)',
  );
  if (stripRgba && darkPageBg && fg) {
    const composited = over(stripRgba, darkPageBg);
    const ratio = contrast(composited, fg.rgb);
    log('Strip vs text contrast ≥ 4.5 (AA)', ratio >= 4.5, `${ratio.toFixed(2)}:1 (composited rgb(${composited.join(',')}))`);
  } else {
    log('Contrast computable', false, 'missing color samples');
  }

  await page.screenshot({ path: '/tmp/dock-dark-mobile.png' });
  const pass = results.every((r) => r.ok);
  console.log(pass ? '\nALL CHECKS PASSED' : `\n${results.filter((r) => !r.ok).length} FAILURES`);
  process.exitCode = pass ? 0 : 1;
} finally {
  await browser.close();
}
