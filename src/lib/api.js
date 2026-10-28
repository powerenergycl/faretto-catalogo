import { applyFarettoNombres } from './catalog.js';

export * from './catalog.js';

// Todo el catalogo viene de sitio_power, filtrado por marca del lado del
// servidor (nombre/SKU con "faretto"). Este sitio no tiene base de datos
// propia ni credenciales de Supabase - es un cliente de solo lectura de
// /api/public/faretto-productos.
//
// En dev, VITE_SITIO_POWER_API_BASE puede apuntar a localhost:4000 (backend
// de sitio_power corriendo en paralelo). En produccion cae al dominio real.
const API_BASE = import.meta.env.VITE_SITIO_POWER_API_BASE || 'https://powerenergy.cl';

export async function fetchFarettoProductos() {
  // Los nombres editables de familia/modelo (Power Admin > Faretto > Nombres)
  // se aplican antes de devolver el feed, para que resolveFamily/resolveModelo
  // ya los usen en el primer render. Si falla, se sigue con los derivados.
  const [response] = await Promise.all([
    fetch(`${API_BASE}/api/public/faretto-productos`),
    fetchFarettoNombres().then(applyFarettoNombres).catch(() => {})
  ]);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.productos) ? data.productos : [];
}

async function fetchFarettoNombres() {
  const response = await fetch(`${API_BASE}/api/public/faretto-nombres`);
  if (!response.ok) return { familias: {}, modelos: {} };
  return response.json();
}

// Galeria de fichas (6 fotos por familia+modelo): administrable desde Power
// Admin > sitio Faretto > Galeria de producto. Vive aparte de "imagen" (la
// foto principal, atada a un SKU en el feed de arriba) porque pertenece al
// "producto principal" que agrupa varias potencias/temperaturas, no a una
// variante puntual - ver buildProductGroups mas abajo, que la matchea por
// familyId + modelo. Si el fetch falla, la ficha simplemente no muestra
// galeria (nunca debe tumbar el catalogo).
export async function fetchFarettoGaleria() {
  const response = await fetch(`${API_BASE}/api/public/faretto-galeria`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data.grupos) ? data.grupos : [];
}

// Accesos destacados del home: administrables desde el panel de sitio_power
// (Power Admin > sitio Faretto > Accesos destacados). Si el fetch falla o
// todavia no hay ninguno cargado, HomePage cae a una lista fija propia -
// nunca debe quedar la seccion vacia.
export async function fetchFarettoAccesos() {
  const response = await fetch(`${API_BASE}/api/public/faretto-accesos`);
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los accesos (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
}

// Orden de las secciones del home (bloque SEO, banners "Novedades", blog),
// administrable desde Power Admin > sitio Faretto > Orden del Home. Mismo
// default que el backend (publicCatalogService.js#FARETTO_HOME_LAYOUT_DEFAULT)
// por si el fetch falla.
export const FARETTO_HOME_LAYOUT_DEFAULT = ['seo-intro', 'banners', 'blog'];

export async function fetchFarettoHomeLayout() {
  const response = await fetch(`${API_BASE}/api/public/faretto-home-layout`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el orden del home (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.orden) && data.orden.length > 0 ? data.orden : FARETTO_HOME_LAYOUT_DEFAULT;
}

// Menu principal (barra superior): administrable desde Power Admin > sitio
// Faretto > Menu principal. Si el fetch falla o todavia no hay ningun item
// cargado, Header cae a su lista fija propia - la barra nunca debe quedar
// vacia.
export async function fetchFarettoMenu() {
  const response = await fetch(`${API_BASE}/api/public/faretto-menu`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el menu (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
}

// Grilla de banners de "Novedades": administrable desde Power Admin > sitio
// Faretto > Diseño de Home > Grilla banners. Mientras no haya ninguna grilla
// cargada, HomePage rellena esa seccion con productos del catalogo en vez
// de imagenes (ver BannersSection).
export async function fetchFarettoBanners() {
  const response = await fetch(`${API_BASE}/api/public/faretto-banners`);
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los banners (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.grids) ? data.grids : [];
}

// Hero/slider debajo del header: administrable desde Power Admin > sitio
// Faretto > grupo Faretto > Hero / Slider. Tabla propia (faretto_hero_slides),
// no compartida con el slider de sitio_power.
export async function fetchFarettoHeroSlides() {
  const response = await fetch(`${API_BASE}/api/public/faretto-hero-slides`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el hero (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.slides) ? data.slides : [];
}

// Directorio de distribuidores (/distribuidores): administrable desde Power
// Admin > sitio Faretto > grupo Faretto > Distribuidores.
export async function fetchFarettoDistribuidores() {
  const response = await fetch(`${API_BASE}/api/public/faretto-distribuidores`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el directorio (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.distribuidores) ? data.distribuidores : [];
}

// Paginas de contenido (ej. /quienes-somos): administrable desde Power Admin
// > sitio Faretto > grupo Faretto > Páginas.
export async function fetchFarettoPagina(slug) {
  const response = await fetch(`${API_BASE}/api/public/faretto-paginas/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`No se pudo cargar la pagina (HTTP ${response.status})`);
  }
  return response.json();
}

// Envio del formulario de contacto (/contacto). Los mensajes se revisan
// desde Power Admin > sitio Faretto > grupo Faretto > Mensajes de contacto.
export async function submitFarettoContacto(payload) {
  const response = await fetch(`${API_BASE}/api/public/faretto-contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `No se pudo enviar el mensaje (HTTP ${response.status})`);
  }
  return data;
}

// Blog: administrable desde Power Admin > sitio Faretto (mismos articulos que
// se editan ahi, independientes de los que ya tiene sitio_power - ver
// listFarettoBlogPublic/getFarettoBlogPostPublic en publicCatalogService.js).
export async function fetchFarettoBlog() {
  const response = await fetch(`${API_BASE}/api/public/faretto-blog`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el blog (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.posts) ? data.posts : [];
}

export async function fetchFarettoBlogPost(slug) {
  const response = await fetch(`${API_BASE}/api/public/faretto-blog/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`No se pudo cargar el articulo (HTTP ${response.status})`);
  }
  return response.json();
}

