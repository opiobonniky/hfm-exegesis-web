const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Go to BibleLibrary directly
  await page.goto('http://localhost:5173/bible-library', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Take screenshot of BibleLibrary page
  await page.screenshot({ path: '/tmp/bible-library.png', fullPage: false });
  console.log('Screenshot 1: BibleLibrary page saved');

  // Try to find and click on Genesis to expand it
  const genesisBtn = page.locator('button:has-text("Genesis")').first();
  if (await genesisBtn.isVisible()) {
    await genesisBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/bible-library-expanded.png', fullPage: false });
    console.log('Screenshot 2: Genesis expanded with teaser saved');
  } else {
    console.log('Genesis button not found - may need login');
    // Check if we're on login page
    const url = page.url();
    console.log('Current URL:', url);
    await page.screenshot({ path: '/tmp/bible-library-current.png', fullPage: false });
  }

  await browser.close();
})();
