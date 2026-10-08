import { chromium } from 'playwright';

const browser = await chromium.launch();

// Desktop: sidebar visible, no burger
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:5174/precio-lista', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tmp/precio-lista-v2-desktop.png' });

  const items = page.locator('.price-family-tree button');
  await items.nth(6).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tmp/precio-lista-v2-desktop-selected.png' });
  await page.close();
}

// Mobile: burger closed, then open, then select
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:5174/precio-lista', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tmp/precio-lista-v2-mobile-closed.png' });

  await page.locator('.price-family-toggle').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tmp/precio-lista-v2-mobile-open.png' });

  const items = page.locator('.price-family-tree button');
  await items.nth(3).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tmp/precio-lista-v2-mobile-after-select.png' });
  await page.close();
}

await browser.close();
console.log('done');
