import * as data from './data.js';
import { SITE_URL } from './page.js';

// /llms.txt (propuesta llmstxt.org): resumen en Markdown del sitio para
// asistentes de IA, con links a las paginas que conviene leer. Se arma con
// los mismos datos publicados (familias, modelos, blog), cache de una hora.
const TTL_MS = 60 * 60 * 1000;
let cache = { text: null, at: 0 };

async function build(ssr) {
  const [productos, blogPosts, nombres] = await Promise.all([data.getProductos(), data.getBlogPosts(), data.getNombres()]);
  if (!productos && cache.text) return cache.text;
  if (nombres) ssr.applyFarettoNombres(nombres);

  const lines = [
    '# Faretto Chile',
    '',
    '> Catálogo oficial de iluminación técnica Faretto en Chile: plafones, paneles LED, luminaria pública, proyectores, campanas industriales, equipos de emergencia, cintas LED y más, con especificaciones y ficha técnica por modelo. Power Energy (https://www.powerenergy.cl) es distribuidor autorizado de Faretto en Chile.',
    '',
    '- Cotizaciones y venta: Power Energy, https://www.powerenergy.cl',
    `- Distribuidores autorizados por zona: ${SITE_URL}/distribuidores`,
    `- Contacto: ${SITE_URL}/contacto`,
    ''
  ];

  const families = new Map();
  for (const product of productos || []) {
    const family = ssr.resolveFamily(product.nombre);
    if (!families.has(family.id)) families.set(family.id, { label: family.label, count: 0, modelos: new Map() });
    const entry = families.get(family.id);
    entry.count += 1;
    if (ssr.modeloSlug(product.nombre)) entry.modelos.set(ssr.productPath(product), ssr.resolveModelo(product.nombre));
  }

  lines.push('## Catálogo por familia', '');
  for (const family of ssr.FAMILIES) {
    const entry = families.get(family.id);
    if (!entry) continue;
    lines.push(`- [${entry.label}](${SITE_URL}${ssr.familyPath(family.id)}): ${entry.count} productos`);
    for (const [path, modelo] of [...entry.modelos].sort((a, b) => a[1].localeCompare(b[1], 'es'))) {
      lines.push(`  - [${modelo}](${SITE_URL}${path})`);
    }
  }

  if (blogPosts?.length) {
    lines.push('', '## Guías y artículos', '');
    for (const post of blogPosts) {
      const resumen = (post.resumen || '').replace(/\s+/g, ' ').trim();
      lines.push(`- [${post.titulo}](${SITE_URL}/blog/${post.slug})${resumen ? `: ${resumen}` : ''}`);
    }
  }

  lines.push('', '## Opcional', '', `- [Catálogo completo](${SITE_URL}/catalogo)`, `- [Sitemap](${SITE_URL}/sitemap.xml)`, '');
  return lines.join('\n');
}

export async function llmsTxt(ssr) {
  if (!cache.text || Date.now() - cache.at > TTL_MS) cache = { text: await build(ssr), at: Date.now() };
  return cache.text;
}
