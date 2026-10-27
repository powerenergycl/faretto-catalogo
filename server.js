import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, resolveFamily } from './src/lib/families.js';

// Server minimo: sirve el build estatico (dist/), un healthcheck y el
// sitemap.xml/robots.txt. No hay API propia ni credenciales de Supabase aca -
// todos los datos vienen de sitio_power via /api/public/faretto-* (ver
// src/lib/api.js).
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const port = process.env.PORT || 8080;
const SITE_URL = (process.env.SITE_URL || 'https://www.faretto.cl').replace(/\/$/, '');
const API_BASE = process.env.SITIO_POWER_API_BASE || 'https://powerenergy.cl';
const SITEMAP_TTL_MS = 60 * 60 * 1000;

app.use(compression());

// faretto.cl y www.faretto.cl apuntan al mismo servicio: se unifica en www
// para que Google no indexe todo dos veces.
app.use((req, res, next) => {
  if (req.hostname === 'faretto.cl') return res.redirect(301, `${SITE_URL}${req.originalUrl}`);
  next();
});

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, version: process.env.APP_VERSION || 'local' });
});

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

// Se arma con lo que hay publicado en sitio_power (productos, blog, paginas
// del CMS) y se cachea en memoria una hora: un articulo o pagina nueva
// aparece sola sin redeploy. Si sitio_power falla, se sirve la ultima
// version buena (o solo las rutas fijas).
let sitemapCache = { xml: null, at: 0 };

async function fetchJson(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const toDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);

async function buildSitemap() {
  const [productosRes, blogRes, paginasRes] = await Promise.all([
    fetchJson(`${API_BASE}/api/public/faretto-productos`),
    fetchJson(`${API_BASE}/api/public/faretto-blog`),
    fetchJson(`${API_BASE}/api/public/faretto-paginas`)
  ]);
  if (!productosRes && !blogRes && sitemapCache.xml) return sitemapCache.xml;

  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/catalogo', priority: '0.9' },
    { loc: '/blog', priority: '0.7' },
    { loc: '/distribuidores', priority: '0.6' },
    { loc: '/quienes-somos', priority: '0.5' },
    { loc: '/contacto', priority: '0.5' }
  ];

  // Solo familias con productos publicados (una familia vacia seria una
  // pagina sin contenido).
  const productos = productosRes?.productos || [];
  const familiasConProductos = new Set(productos.map((p) => resolveFamily(p.nombre).id));
  FAMILIES.filter((f) => familiasConProductos.has(f.id))
    .forEach((f) => urls.push({ loc: `/catalogo?familia=${f.id}`, priority: '0.8' }));
  if (productos.some((p) => /lumex/i.test(p.nombre))) urls.push({ loc: '/catalogo?marca=lumex', priority: '0.7' });

  (blogRes?.posts || []).forEach((post) => urls.push({ loc: `/blog/${post.slug}`, lastmod: toDate(post.fecha_publicacion), priority: '0.6' }));

  // quienes-somos vive en la tabla de paginas pero tiene ruta propia (arriba).
  (paginasRes?.paginas || [])
    .filter((pagina) => pagina.slug !== 'quienes-somos')
    .forEach((pagina) => urls.push({ loc: `/pagina/${pagina.slug}`, lastmod: toDate(pagina.actualizado_en), priority: '0.4' }));

  const body = urls.map(({ loc, lastmod, priority }) => [
    '  <url>',
    `    <loc>${escapeXml(SITE_URL + loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].filter(Boolean).join('\n')).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

app.get('/sitemap.xml', async (_req, res) => {
  if (!sitemapCache.xml || Date.now() - sitemapCache.at > SITEMAP_TTL_MS) {
    sitemapCache = { xml: await buildSitemap(), at: Date.now() };
  }
  res.set('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(sitemapCache.xml);
});

app.use(express.static(distPath, {
  index: false,
  maxAge: '1y',
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// SPA fallback: rutas reales (Home, /catalogo, /blog, /blog/:slug) resueltas
// del lado del cliente por App.jsx.
app.get('*', (_req, res) => {
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`Faretto catalogo escuchando en http://localhost:${port}`);
});
