import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await page.goto('http://localhost:4327/distribuidores', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'tmp/distribuidores-tab1.png' });

await page.locator('.tab-link', { hasText: 'Regiones' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'tmp/distribuidores-tab2.png' });

await browser.close();
console.log('done');
