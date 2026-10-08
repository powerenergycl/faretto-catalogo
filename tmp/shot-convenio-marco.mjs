import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto('https://faretto.cl/convenio-marco', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'tmp/convenio-marco-live.png', fullPage: true });
await browser.close();
console.log('done');
