import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 750 } });
page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));
page.on('requestfailed', (req) => console.log('FAILED:', req.url(), req.failure()?.errorText));
page.on('response', (res) => { if (res.url().includes('faretto-menu')) console.log('RESPONSE faretto-menu:', res.status()); });
await page.goto('http://localhost:4324/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await browser.close();
