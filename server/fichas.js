// Fichas técnicas en /fichas/CODIGO (ej. /fichas/FT-LX-SAGITTA-DS1).
// La ficha se edita y se publica en el Maestro de Productos; este sitio solo la
// muestra. Se pide la última revisión publicada y se guarda 10 minutos en
// memoria; si el origen falla, se sigue sirviendo la última copia buena.

const ORIGEN = (process.env.FICHAS_API_BASE || 'https://fluxo-control-822427211718.us-central1.run.app').replace(/\/$/, '');
const TTL_MS = 10 * 60 * 1000;
const MAX_FICHAS = 500;
const CODIGO = /^FT-[A-Z0-9]+(-[A-Z0-9]+)+$/;
const cache = new Map();

/** Código de ficha válido en mayúsculas, o null si la ruta no es una ficha nueva. */
export function codigoFicha(raw = '') {
  const codigo = String(raw).trim().toUpperCase();
  return codigo.length <= 60 && CODIGO.test(codigo) ? codigo : null;
}

/** HTML de la ficha publicada, o null si no existe. */
export async function fichaHtml(codigo, { fetchImpl = fetch, ahora = Date.now() } = {}) {
  const guardada = cache.get(codigo);
  if (guardada && ahora - guardada.en < TTL_MS) return guardada.html;
  try {
    const r = await fetchImpl(`${ORIGEN}/api/public/fichas/${encodeURIComponent(codigo)}`, { signal: AbortSignal.timeout(8000) });
    if (r.status === 404) {
      cache.delete(codigo);
      return null;
    }
    if (!r.ok) throw new Error(`origen respondió ${r.status}`);
    const html = await r.text();
    if (cache.size >= MAX_FICHAS) cache.delete(cache.keys().next().value);
    cache.set(codigo, { html, en: ahora });
    return html;
  } catch (error) {
    console.warn(`[fichas] ${codigo}: ${error.message}`);
    return guardada ? guardada.html : null;
  }
}

/** HTML del catálogo publicado (última edición), o null si aún no se publica ninguna. */
export async function catalogoHtml({ fetchImpl = fetch, ahora = Date.now() } = {}) {
  const LLAVE = '__catalogo__';
  const guardada = cache.get(LLAVE);
  if (guardada && ahora - guardada.en < TTL_MS) return guardada.html;
  try {
    const r = await fetchImpl(`${ORIGEN}/api/public/catalogo`, { signal: AbortSignal.timeout(15000) });
    if (r.status === 404) {
      cache.delete(LLAVE);
      return null;
    }
    if (!r.ok) throw new Error(`origen respondió ${r.status}`);
    const html = await r.text();
    cache.set(LLAVE, { html, en: ahora });
    return html;
  } catch (error) {
    console.warn(`[catalogo] ${error.message}`);
    return guardada ? guardada.html : null;
  }
}
