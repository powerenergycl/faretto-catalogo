import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
await page.goto('http://localhost:4326/catalogo?marca=lumex', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'tmp/lumex-page.png', fullPage: true });

// Zoom on one card's badge
const card = page.locator('.product-sheet').first();
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await card.screenshot({ path: 'tmp/lumex-card.png' });

await browser.close();
console.log('done');
