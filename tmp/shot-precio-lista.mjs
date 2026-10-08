import { chromium } from 'playwright';

const browser = await chromium.launch();

for (const [name, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  await page.goto('http://localhost:5174/precio-lista', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tmp/precio-lista-${name}-top.png` });

  // Click a tab further along (not the first) to see the active state mid-strip
  const tabs = page.locator('.tab-link');
  const count = await tabs.count();
  if (count > 3) {
    await tabs.nth(3).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `tmp/precio-lista-${name}-tab4.png` });
  }
  await page.close();
}

await browser.close();
console.log('done');
