import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto('http://localhost:4328/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'tmp/chat-closed.png' });

await page.locator('.chat-fab').click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'tmp/chat-open.png' });

await page.locator('.chat-suggestions button', { hasText: 'Focos' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'tmp/chat-results.png' });

await page.locator('.chat-input-row input').fill('xyz123noexiste');
await page.locator('.chat-input-row button').click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'tmp/chat-noresults.png' });

await browser.close();
console.log('done');
