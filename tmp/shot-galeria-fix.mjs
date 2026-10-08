import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('https://faretto.cl/catalogo?familia=luminaria-publica', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'tmp/galeria-fix-luminaria.png' });
await browser.close();
console.log('done');
