import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 750 } });
await page.goto('http://localhost:4324/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
console.log(await page.locator('.public-nav').innerHTML());
await browser.close();
