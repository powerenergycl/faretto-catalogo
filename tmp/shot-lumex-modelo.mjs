import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
await page.goto('http://localhost:5174/catalogo?marca=lumex', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'tmp/lumex-modelo-titulo.png', fullPage: true });
await browser.close();
console.log('done');
