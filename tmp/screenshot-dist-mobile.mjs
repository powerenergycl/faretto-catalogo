import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 700 } });
await page.goto('http://localhost:4327/distribuidores', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'tmp/distribuidores-mobile.png' });
await browser.close();
console.log('done');
