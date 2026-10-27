// Reglas de familia sin dependencias de Vite: las importa el frontend (via
// lib/api.js) y tambien server.js para armar /sitemap.xml.

// Heuristica liviana de familia a partir del nombre, mientras sitio_power no
// exponga una categoria/familia explicita en el feed publico. Mismo patron
// de matching por texto que ya usa el resto del catalogo Faretto.
//
// Ampliado (analisis del 26-08-2026): ~200 de los 387 SKU publicados caian
// en "Otros" por falta de reglas, no porque no tuvieran una familia real -
// casi todos ya traen "Modelo X" igual que el resto del catalogo. Las reglas
// nuevas de abajo cubren los tipos de producto mas grandes de ese resto.
// A proposito SOLO en este archivo: sitio_power/backend mantiene su propia
// copia de este criterio (FARETTO_FAMILY_RULES en publicCatalogService.js,
// usada por el dropdown de Familia/Modelo de Power Admin > Galeria de
// producto) y no se toca aca - las dos clasificaciones pueden divergir sin
// romper nada hoy (esa tabla de galeria todavia esta vacia para todo el
// catalogo). Si mas adelante se sube una galeria para un producto de una
// familia nueva de aca, replicar la regla alla para que la key calce.
export const FAMILY_RULES = [
  // "embutido ... cob" sumado aca (no es su propia familia): son downlights
  // empotrados sin la palabra "Plafón" en el nombre (Modelo Kraz - viene en
  // dos variantes de nombre, "Embutido COB..." y "Embutido Downlight
  // Redondo COB...", por eso el .* en vez de exigirlos pegados), mismo
  // concepto fisico que el resto de Plafones.
  { id: 'plafones', label: 'Plafones', test: /plaf[oó]n|embutido\b.*\bcob\b/i },
  { id: 'luminaria-publica', label: 'Luminaria pública', test: /luminaria p[uú]blica/i },
  { id: 'cintas-led', label: 'Cintas LED', test: /cinta led/i },
  // "led panel" (orden invertido, ej. Modelo Indus/Musca) sumado - antes solo
  // matcheaba "panel led" y esos 16 SKU quedaban en Otros por una diferencia
  // de orden de palabras, no por ser una familia distinta.
  { id: 'paneles-led', label: 'Paneles LED', test: /panel(?:es)? led|led panel(?:es)?/i },
  { id: 'focos', label: 'Focos', test: /\bfoco\b/i },
  { id: 'tubos', label: 'Tubos y otros', test: /tubo led/i },
  { id: 'proyectores', label: 'Proyectores', test: /^proyector/i },
  { id: 'campanas-led', label: 'Campanas LED', test: /^campana/i },
  { id: 'equipos-emergencia', label: 'Equipos de Emergencia', test: /^kit de emergencia|^l[aá]mpara emergencia|^letrero de salida/i },
  { id: 'colgantes', label: 'Colgantes', test: /^colgante\b/i },
  // Bases + ampolletas GU10 del sistema Antares - se venden y navegan juntas.
  { id: 'ampolletas-bases', label: 'Ampolletas y Bases', test: /^ampolleta\b|^base\b/i },
  // Piezas de riel/track light (Antares/Procyon/Ara): union, transformador,
  // perfil de aluminio, etc. - accesorios del mismo sistema, no luminarias
  // en si mismas.
  { id: 'riel-track', label: 'Riel y Track Light', test: /^riel\b|^uni[oó]n\b|^track\b|^transformador\b|^perfil\b/i },
  { id: 'antiexplosivos-estancos', label: 'Antiexplosivos y Estancos', test: /estanco/i },
  { id: 'apliques', label: 'Apliques', test: /^aplique\b/i },
  // Componentes electricos sueltos sin luz propia (fuente de poder, sensor,
  // fotocelda, conector, protector, regleta, marco para panel).
  { id: 'accesorios-componentes', label: 'Accesorios y Componentes', test: /^fuente\b|^fotocelda\b|^sensor\b|^conector\b|^protector\b|^regleta\b|^marco\b/i }
];

export const OTROS_FAMILY = { id: 'otros', label: 'Otros' };

export function resolveFamily(nombre = '') {
  const match = FAMILY_RULES.find((rule) => rule.test.test(nombre));
  return match || OTROS_FAMILY;
}

// "Otros" al final: cubre lo que de verdad no tiene una familia clara
// (tortugas, calugas, iluminacion solar puntual, postes, etc. - un residual
// chico y genuinamente variado, no ya ~200 SKU por falta de reglas).
export const FAMILIES = [...FAMILY_RULES.map(({ id, label }) => ({ id, label })), OTROS_FAMILY];
