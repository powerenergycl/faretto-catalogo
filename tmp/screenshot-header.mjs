import { chromium } from 'playwright';

const browser = await chromium.launch();

// Desktop, top of page (header teal)
const page1 = await browser.newPage({ viewport: { width: 1400, height: 500 } });
await page1.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await page1.screenshot({ path: 'tmp/header-desktop-top.png' });

// Desktop, scrolled (header white)
await page1.evaluate(() => window.scrollTo(0, 400));
await page1.waitForTimeout(400);
await page1.screenshot({ path: 'tmp/header-desktop-scrolled.png' });

// Open the "Categorias" megamenu to check contrast/positioning
const catTrigger = page1.locator('.mega-menu-trigger');
if (await catTrigger.count() > 0) {
  await page1.evaluate(() => window.scrollTo(0, 0));
  await page1.waitForTimeout(300);
  await catTrigger.first().click();
  await page1.waitForTimeout(300);
  await page1.screenshot({ path: 'tmp/header-desktop-megamenu.png' });
}
await page1.close();

// Mobile, menu closed then open
const page2 = await browser.newPage({ viewport: { width: 390, height: 700 } });
await page2.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await page2.screenshot({ path: 'tmp/header-mobile-closed.png' });
const burger = page2.locator('.nav-burger');
await burger.click();
await page2.waitForTimeout(300);
await page2.screenshot({ path: 'tmp/header-mobile-open.png', fullPage: false });
await page2.close();

await browser.close();
console.log('done');
