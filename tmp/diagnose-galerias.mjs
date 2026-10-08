import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('https://faretto.cl/catalogo', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.product-sheet', { timeout: 20000 });

// Scroll hasta el final para que "Cargar mas" no deje fichas afuera del DOM,
// si el catalogo pagina en el cliente.
let prevCount = 0;
for (let i = 0; i < 30; i++) {
  const btn = await page.$('.pager button');
  if (!btn) break;
  await btn.click();
  await page.waitForTimeout(400);
  const count = await page.locator('.product-sheet').count();
  if (count === prevCount) break;
  prevCount = count;
}

const fichas = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.product-sheet')).map((article) => {
    const titulo = article.querySelector('.product-sheet-name')?.textContent?.trim() || '';
    const slots = Array.from(article.querySelectorAll('.product-sheet-gallery-tile')).map((tile) => Boolean(tile.querySelector('img')));
    return { titulo, slots };
  });
});

console.log('Total fichas en /catalogo:', fichas.length);
const conMasDeUna = fichas.filter((f) => f.slots.filter(Boolean).length > 1);
console.log('Con mas de 1 foto:', conMasDeUna.length);

console.log('\n| Modelo | Foto1 | Foto2 | Foto3 | Foto4 | Foto5 | Foto6 |');
console.log('|---|---|---|---|---|---|---|');
conMasDeUna.forEach((f) => {
  const row = [0, 1, 2, 3, 4, 5].map((i) => (f.slots[i] ? 'si' : 'no'));
  console.log(`| ${f.titulo} | ${row.join(' | ')} |`);
});

await browser.close();
