import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto('http://localhost:5174/catalogo?marca=lumex', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.screenshot({ path: 'tmp/lumex-sidebar-todos.png' });

// Click a modelo in the sidebar
const modeloBtn = page.locator('.filter-tree-sub button', { hasText: 'Sagitta' });
await modeloBtn.first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'tmp/lumex-sidebar-sagitta.png' });

await browser.close();
console.log('done');
