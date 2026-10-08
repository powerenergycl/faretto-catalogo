import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';

const OUT_DIR = 'tmp/fotos-lumex';
fs.mkdirSync(OUT_DIR, { recursive: true });

function sanitize(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, destPath).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} en ${url}`));
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('https://faretto.cl/catalogo?marca=lumex', { waitUntil: 'networkidle' });
await page.waitForSelector('.product-sheet', { timeout: 15000 });

const fichas = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.product-sheet')).map((article) => {
    const titulo = article.querySelector('.product-sheet-name')?.textContent?.trim() || 'sin-titulo';
    const skus = Array.from(article.querySelectorAll('.price-cell-sku, td, .product-sheet-table td'))
      .map((el) => el.textContent.trim());
    const fotos = Array.from(article.querySelectorAll('.product-sheet-gallery-tile img'))
      .map((img) => img.getAttribute('src'))
      .filter(Boolean);
    return { titulo, fotos };
  });
});

console.log(`Fichas encontradas en /catalogo?marca=lumex: ${fichas.length}\n`);

let totalDescargadas = 0;
const sinFoto = [];

for (const ficha of fichas) {
  if (ficha.fotos.length === 0) {
    sinFoto.push(ficha.titulo);
    continue;
  }
  const folder = path.join(OUT_DIR, sanitize(ficha.titulo));
  fs.mkdirSync(folder, { recursive: true });
  for (let i = 0; i < ficha.fotos.length; i++) {
    const url = ficha.fotos[i];
    const ext = (url.match(/\.(jpe?g|png|webp|gif)(\?|$)/i)?.[1] || 'jpg').toLowerCase();
    const dest = path.join(folder, `foto-${i + 1}.${ext}`);
    try {
      await download(url, dest);
      totalDescargadas++;
    } catch (err) {
      console.error(`  ERROR descargando ${url}:`, err.message);
    }
  }
  console.log(`OK  "${ficha.titulo}" -> ${ficha.fotos.length} foto(s) en ${folder}`);
}

console.log(`\nTotal fotos descargadas: ${totalDescargadas}`);
console.log(`\nFichas SIN ninguna foto (quedan pendientes de subir a mano): ${sinFoto.length}`);
sinFoto.forEach((t) => console.log(' -', t));

await browser.close();
