// Todo el catalogo viene de sitio_power, filtrado por marca del lado del
// servidor (nombre/SKU con "faretto"). Este sitio no tiene base de datos
// propia ni credenciales de Supabase - es un cliente de solo lectura de
// /api/public/faretto-productos.
//
// En dev, VITE_SITIO_POWER_API_BASE puede apuntar a localhost:4000 (backend
// de sitio_power corriendo en paralelo). En produccion cae al dominio real.
const API_BASE = import.meta.env.VITE_SITIO_POWER_API_BASE || 'https://powerenergy.cl';

export async function fetchFarettoProductos() {
  const response = await fetch(`${API_BASE}/api/public/faretto-productos`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data.productos) ? data.productos : [];
}

export function formatPrice(value) {
  if (value === null || value === undefined) return 'Consultar';
  return Number(value).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

// Heuristica liviana de familia a partir del nombre, mientras sitio_power no
// exponga una categoria/familia explicita en el feed publico. Mismo patron
// de matching por texto que ya usa el resto del catalogo Faretto.
const FAMILY_RULES = [
  { id: 'plafones', label: 'Plafones', test: /plaf[oó]n/i },
  { id: 'luminaria-publica', label: 'Luminaria pública', test: /luminaria p[uú]blica/i },
  { id: 'cintas-led', label: 'Cintas LED', test: /cinta led/i },
  { id: 'paneles-led', label: 'Paneles LED', test: /panel(?:es)? led/i },
  { id: 'focos', label: 'Focos', test: /\bfoco\b/i },
  { id: 'tubos', label: 'Tubos y otros', test: /tubo led/i }
];

export function resolveFamily(nombre = '') {
  const match = FAMILY_RULES.find((rule) => rule.test.test(nombre));
  return match || { id: 'otros', label: 'Otros' };
}

export const FAMILIES = FAMILY_RULES.map(({ id, label }) => ({ id, label }));
