import * as data from './data.js';
import { SITE_URL } from './page.js';

// /sitemap.xml: se arma con lo publicado en sitio_power (productos, blog,
// paginas del CMS) y se cachea una hora, asi lo nuevo aparece solo sin
// redeploy. Si sitio_power falla, se sirve la ultima version buena.
const TTL_MS = 60 * 60 * 1000;
let cache = { xml: null, at: 0 };

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const toDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);

async function build(ssr) {
  const [productos, blogPosts, paginas] = await Promise.all([data.getProductos(), data.getBlogPosts(), data.getPaginas()]);
  if (!productos && !blogPosts && cache.xml) return cache.xml;

  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/catalogo', priority: '0.9' },
    { loc: '/blog', priority: '0.7' },
    { loc: '/distribuidores', priority: '0.6' },
    { loc: '/contacto', priority: '0.5' }
  ];

  // Familias y modelos con productos publicados (una familia vacia seria una
  // pagina sin contenido). Los productos sin "Modelo X" no tienen pagina
  // propia: quedan en la de su familia.
  const familias = new Set();
  const modelos = new Set();
  for (const product of productos || []) {
    familias.add(ssr.familyPath(ssr.resolveFamily(product.nombre).id));
    if (ssr.modeloSlug(product.nombre)) modelos.add(ssr.productPath(product));
  }
  ssr.FAMILIES.map((family) => ssr.familyPath(family.id)).filter((loc) => familias.has(loc))
    .forEach((loc) => urls.push({ loc, priority: '0.8' }));
  [...modelos].sort().forEach((loc) => urls.push({ loc, priority: '0.7' }));
  if ((productos || []).some((product) => ssr.isLumex(product.nombre))) urls.push({ loc: ssr.LUMEX_PATH, priority: '0.7' });

  (blogPosts || []).forEach((post) => urls.push({ loc: `/blog/${post.slug}`, lastmod: toDate(post.fecha_publicacion), priority: '0.6' }));

  // quienes-somos vive en la tabla de paginas pero tiene ruta propia.
  (paginas || []).forEach((pagina) => urls.push({
    loc: pagina.slug === 'quienes-somos' ? '/quienes-somos' : `/pagina/${pagina.slug}`,
    lastmod: toDate(pagina.actualizado_en),
    priority: '0.5'
  }));

  const body = urls.map(({ loc, lastmod, priority }) => [
    '  <url>',
    `    <loc>${escapeXml(SITE_URL + loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].filter(Boolean).join('\n')).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export async function sitemapXml(ssr) {
  if (!cache.xml || Date.now() - cache.at > TTL_MS) cache = { xml: await build(ssr), at: Date.now() };
  return cache.xml;
}
