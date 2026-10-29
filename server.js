import express from 'express';
import compression from 'compression';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getProductos } from './server/data.js';
import { loadPage, headTags, safeJson, SITE_URL } from './server/page.js';
import { sitemapXml } from './server/sitemap.js';
import { llmsTxt } from './server/llms.js';
import { legacyRedirectTarget } from './server/legacyRedirects.js';

// Sirve el build (dist/) renderizando cada pagina del lado del servidor con
// los mismos componentes React del navegador (dist/server/entry-server.js),
// asi buscadores y asistentes de IA reciben el contenido real en el HTML.
// No hay API propia ni credenciales de Supabase aca - todos los datos vienen
// de sitio_power via /api/public/faretto-* (ver server/data.js).
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const ssrEntry = path.join(distPath, 'server', 'entry-server.js');
const port = process.env.PORT || 8080;

const template = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : null;
const ssr = fs.existsSync(ssrEntry) ? await import(pathToFileURL(ssrEntry).href) : null;
if (!ssr) console.warn('Sin build SSR (dist/server): se sirve index.html sin render del servidor.');

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

app.get('/llms.txt', async (_req, res) => {
  if (!ssr) return res.status(503).end();
  res.set('Cache-Control', 'public, max-age=3600');
  res.type('text/markdown').send(await llmsTxt(ssr));
});

app.get('/sitemap.xml', async (_req, res) => {
  if (!ssr) return res.status(503).end();
  res.set('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(await sitemapXml(ssr));
});

// dist/server es el bundle SSR: se usa por dentro, no se publica.
app.use('/server', (_req, res) => res.status(404).type('text/plain').send('Not found'));

app.use(express.static(distPath, {
  index: false,
  maxAge: '1y',
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// URLs del WordPress anterior que Google todavia muestra (incluidos los PDF
// de /fichas/) -> su equivalente actual. Ver server/legacyRedirects.js.
app.get('*', (req, res, next) => {
  const target = legacyRedirectTarget(req.path);
  return target ? res.redirect(301, target) : next();
});

// Archivos que no existen (ej. /favicon.png, /wp-login.php) -> 404 de verdad,
// no la pagina de inicio.
app.get(/\.[a-z0-9]{2,5}$/i, (_req, res) => res.status(404).type('text/plain').send('Not found'));

app.get('*', async (req, res, next) => {
  if (!ssr || !template) return res.sendFile(indexPath);
  try {
    const search = req.originalUrl.slice(req.path.length);

    // URLs viejas del catalogo (?familia=, ?modelo=, ?marca=lumex) -> ruta limpia.
    const legacy = ssr.legacyCatalogPath(req.path, search, (await getProductos()) || []);
    if (legacy) return res.redirect(301, legacy);
    // Una sola URL por pagina: sin "/" final.
    if (req.path.length > 1 && req.path.endsWith('/')) return res.redirect(301, `${req.path.replace(/\/+$/, '')}${search}`);

    const route = ssr.parseRoute(req.path);
    const { status, initialData, head } = await loadPage(route, ssr);
    const appHtml = ssr.render(req.originalUrl, initialData);

    const html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${head.title.replace(/</g, '&lt;')}</title>`)
      .replace(/<meta name="description" content="[^"]*" \/>/, head.description
        ? `<meta name="description" content="${head.description.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" />`
        : '')
      .replace('</head>', `    ${headTags(head, route.pathname)}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>\n    <script>window.__FARETTO_DATA__ = ${safeJson(initialData)};</script>`);

    res.status(status).set('Cache-Control', 'no-cache').type('html').send(html);
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Faretto catalogo escuchando en http://localhost:${port}`);
});
