import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 750 } });
await page.goto('http://localhost:4324/', { waitUntil: 'networkidle' });

const trigger = page.locator('.mega-menu-trigger');
await trigger.waitFor({ state: 'visible', timeout: 10000 });
await trigger.click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'tmp/megamenu-before.png' });

// Hover the longest labels to check wrap in the current (200px) column
for (const label of ['Antiexplosivos y Estancos', 'Accesorios y Componentes', 'Ampolletas y Bases', 'Riel y Track Light']) {
  const item = page.locator('.mega-menu-family', { hasText: label });
  if (await item.count() > 0) {
    await item.first().hover();
    await page.waitForTimeout(150);
  }
}
await page.screenshot({ path: 'tmp/megamenu-before-hover.png' });
await browser.close();
console.log('done');
