// Datos de sitio_power (API publica /api/public/faretto-*) para el render
// del lado del servidor y el sitemap. Cache en memoria de 10 minutos; si
// sitio_power falla se sigue sirviendo la ultima respuesta buena.
const API_BASE = process.env.SITIO_POWER_API_BASE || 'https://powerenergy.cl';
const TTL_MS = 10 * 60 * 1000;
const cache = new Map();

class NotFound extends Error {}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(8000) });
  if (response.status === 404) throw new NotFound(path);
  if (!response.ok) throw new Error(`${path} -> HTTP ${response.status}`);
  return response.json();
}

// Devuelve el valor (cacheado o recien pedido), null si sitio_power dice 404,
// o undefined si fallo y no hay nada cacheado (la pagina se renderiza sin ese
// dato y el navegador lo vuelve a pedir, como antes del SSR).
async function cached(key, loader) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < TTL_MS) return entry.value;
  try {
    const value = await loader();
    cache.set(key, { value, at: Date.now() });
    return value;
  } catch (error) {
    if (error instanceof NotFound) {
      cache.set(key, { value: null, at: Date.now() });
      return null;
    }
    console.error(`[data] ${key}: ${error.message}`);
    return entry ? entry.value : undefined;
  }
}

export const getProductos = () => cached('productos', async () => (await fetchJson('/api/public/faretto-productos')).productos || []);
export const getNombres = () => cached('nombres', () => fetchJson('/api/public/faretto-nombres'));
export const getGaleria = () => cached('galeria', async () => (await fetchJson('/api/public/faretto-galeria')).grupos || []);
export const getHomeLayout = () => cached('homeLayout', async () => (await fetchJson('/api/public/faretto-home-layout')).orden);
export const getBlogPosts = () => cached('blogPosts', async () => (await fetchJson('/api/public/faretto-blog')).posts || []);
export const getBlogPost = (slug) => cached(`blogPost:${slug}`, () => fetchJson(`/api/public/faretto-blog/${encodeURIComponent(slug)}`));
export const getPaginas = () => cached('paginas', async () => (await fetchJson('/api/public/faretto-paginas')).paginas || []);
export const getPagina = (slug) => cached(`pagina:${slug}`, () => fetchJson(`/api/public/faretto-paginas/${encodeURIComponent(slug)}`));
export const getDistribuidores = () => cached('distribuidores', async () => (await fetchJson('/api/public/faretto-distribuidores')).distribuidores || []);
