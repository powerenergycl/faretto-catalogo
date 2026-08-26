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

export function formatPrice(value) {
  if (value === null || value === undefined) return 'Consultar';
  return Number(value).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

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
const FAMILY_RULES = [
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

export function resolveFamily(nombre = '') {
  const match = FAMILY_RULES.find((rule) => rule.test.test(nombre));
  return match || { id: 'otros', label: 'Otros' };
}

// Lumex no es una familia (no describe un tipo de producto) - es una linea
// que cruza varias familias reales (Campanas LED, Paneles LED, Antiexplosivos
// y Estancos, ~11 SKU en total). Se filtra aparte via /catalogo?marca=lumex
// en vez de sumarse a FAMILY_RULES (ver CategoryPage.jsx).
export function isLumex(nombre = '') {
  return /lumex/i.test(nombre);
}

// "Otros" al final: cubre lo que de verdad no tiene una familia clara
// (tortugas, calugas, iluminacion solar puntual, postes, etc. - un residual
// chico y genuinamente variado, no ya ~200 SKU por falta de reglas).
export const FAMILIES = [...FAMILY_RULES.map(({ id, label }) => ({ id, label })), { id: 'otros', label: 'Otros' }];

// El feed nombra el modelo al final del nombre ("... Faretto Modelo X") -
// mismo patron en casi todo el catalogo. Se usa para el submenu de
// modelos dentro de cada familia en el sidebar.
const MODELO_RULE = /\bmodelo\s+(.+)$/i;

export function resolveModelo(nombre = '') {
  const match = nombre.match(MODELO_RULE);
  return match ? match[1].trim() : null;
}

// --- Agrupacion de fichas por modelo ---------------------------------------
// El feed es plano por SKU, pero varios SKU de un mismo "Modelo" son en
// realidad la misma pieza en distintas potencias/temperaturas de color (ver
// ficha impresa de Faretto: 1 foto + 1 tabla de variantes, no una ficha por
// SKU). Agrupar solo por "Modelo" no alcanza - un mismo modelo puede incluir
// productos fisicamente distintos (ej. "Modelo Antares" trae tanto
// ampolletas como bases de montaje). La clave real es
// familia + modelo + nombre generico ya limpio de las palabras que varian
// (potencia, temperatura, IP) - si dos nombres quedan iguales despues de
// limpiarlos, son la misma pieza. Sin "Modelo" en el nombre no hay como
// confirmar que dos productos sean variantes entre si, asi que esos quedan
// siempre solos (nunca se agrupan por similitud de texto sola).
// El color/temperatura de luz no siempre viene como "luz fría/neutra/cálida"
// (frase completa) - varios nombres reales lo traen como adjetivo suelto
// ("... Redondo 12W Fría Económico ...", "... 18W Frío Económico ...") e
// incluso sin tilde ("Luz Frio"). Sin cubrir esas formas, cada temperatura
// quedaba con un "nombre generico" distinto y se armaba una ficha separada
// por temperatura en vez de una fila mas en la tabla de variantes (ver
// modelo Corvus: Fría/Neutro/Frío terminaban en 3 tarjetas sueltas).
const VARIANT_WORD_PATTERN = /\b(ip\d{2}|\d+(?:[.,]\d+)?\s*w|\d{3,4}\s*k|(?:luz\s+)?(?:fr[ií]a|fr[ií]o|c[aá]lida|c[aá]lido|neutra|neutro))\b/gi;

function stripVariantWords(text = '') {
  return text
    .replace(VARIANT_WORD_PATTERN, ' ')
    .replace(/\bfaretto\b/i, ' ')
    .replace(/[-–—,]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeForKey(text) {
  return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// "Tipo de Luz" es redundante con Temperatura (mismo dato en palabras en vez
// de Kelvin) - se descarta en vez de mostrarse dos veces.
const SPEC_LABEL_HIDDEN = 'tipo de luz';
const SPEC_LABEL_TEMPERATURA = 'temperatura';
const SPEC_LABEL_POTENCIA = 'potencia';
const SPEC_LABEL_MEDIDAS = 'medidas';

// Columna fija de la tabla (junto con SKU y Temperatura, que ya son
// siempre-tabla mas abajo): pedido explicito, independiente de si el valor
// de hecho varia entre los SKU del grupo. Potencia y Medidas casi siempre
// cambian por potencia de todos modos, pero si un modelo puntual viene en
// una sola potencia/medida no debe "ascender" a icono - el catalogo espera
// verlas siempre en la tabla de variantes.
const SPEC_LABELS_ALWAYS_TABLE = new Set([SPEC_LABEL_POTENCIA, SPEC_LABEL_MEDIDAS]);

// Color de luz para el circulo de la ficha - solo las 3 categorias fijas
// tienen un color representativo; "RGB" y valores raros/enmascarados no.
const LUZ_COLOR_RULES = [
  { test: /c[aá]lida/i, color: 'calida' },
  { test: /fr[ií]a/i, color: 'fria' },
  { test: /neutr[oa]/i, color: 'neutra' }
];

function resolveLuzColor(valor = '') {
  const rule = LUZ_COLOR_RULES.find(({ test }) => test.test(valor));
  return rule ? rule.color : null;
}

// La mayoria de los SKU no trae spec "Tipo de Luz" (solo algunos), pero
// Temperatura (Kelvin) esta presente en casi todos - se deriva el color de
// ahi como fuente principal. Rango sano 1500-10000K para descartar basura
// como "3CCT" (luz ajustable, no tiene un solo color) o valores enmascarados.
function resolveLuzColorFromKelvin(temperaturaValor = '') {
  const kelvin = parseLeadingNumber(temperaturaValor);
  if (kelvin === null || kelvin < 1500 || kelvin > 10000) return null;
  if (kelvin <= 3200) return 'calida';
  if (kelvin < 5000) return 'neutra';
  return 'fria';
}

function getSpecValue(product, labelLower) {
  const spec = (product.specs || []).find((item) => item.label.toLowerCase() === labelLower);
  return spec ? spec.valor : null;
}

// Algunos valores traen el nombre del label repetido adentro (ej. Medidas:
// "Medidas: Lampara Ø119x4,5mm...") - redundante al lado de una columna/
// icono que ya dice "Medidas". Se limpia solo para mostrar, no toca el dato.
export function cleanSpecValue(label = '', valor = '') {
  const text = String(valor || '').trim();
  const prefix = `${label}:`.toLowerCase();
  return text.toLowerCase().startsWith(prefix) ? text.slice(prefix.length).trim() : text;
}

function parseLeadingNumber(valor) {
  const match = String(valor || '').match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(',', '.')) : null;
}

function buildFichaFromGroup(group, galeriaByKey) {
  const { members } = group;

  // Specs presentes en TODOS los miembros con el mismo valor -> icono
  // compartido, una sola vez arriba de la tabla. Lo que varia entre SKU va
  // de columna en la tabla.
  const allLabels = new Map();
  members.forEach((product) => (product.specs || []).forEach((spec) => allLabels.set(spec.label.toLowerCase(), spec.label)));

  const sharedSpecs = [];
  const varyingLabels = [];
  for (const [labelLower, label] of allLabels) {
    if (labelLower === SPEC_LABEL_HIDDEN || labelLower === SPEC_LABEL_TEMPERATURA) continue;
    const values = members.map((product) => getSpecValue(product, labelLower));
    // Comparacion normalizada (case/espacios) - "6w" y "6W" son el mismo
    // dato, no deberian contar como "varia entre SKU".
    const allSame = values[0] !== null && values.every((valor) => normalizeForKey(valor) === normalizeForKey(values[0]));
    if (allSame && !SPEC_LABELS_ALWAYS_TABLE.has(labelLower)) {
      sharedSpecs.push({ label, valor: values[0] });
    } else {
      varyingLabels.push(label);
    }
  }
  // Potencia (si varia) define la fila - va primera en la tabla.
  varyingLabels.sort((a, b) => {
    if (a.toLowerCase() === SPEC_LABEL_POTENCIA) return -1;
    if (b.toLowerCase() === SPEC_LABEL_POTENCIA) return 1;
    return 0;
  });

  // Filas: mismo valor de Potencia = misma fila. Dentro de la fila, SKU y
  // Temperatura se apilan (la unica dimension que se muestra apilada en vez
  // de como columna propia, igual que en el catalogo impreso).
  const rowsByPotencia = new Map();
  for (const product of members) {
    const potenciaValor = getSpecValue(product, SPEC_LABEL_POTENCIA) || '';
    const rowKey = normalizeForKey(potenciaValor) || product.id;
    if (!rowsByPotencia.has(rowKey)) {
      rowsByPotencia.set(rowKey, { potenciaValor, watts: parseLeadingNumber(potenciaValor), items: [] });
    }
    rowsByPotencia.get(rowKey).items.push(product);
  }

  const rows = [...rowsByPotencia.values()]
    .sort((a, b) => (a.watts ?? Infinity) - (b.watts ?? Infinity))
    .map((row) => {
      const items = [...row.items].sort((a, b) => (
        (parseLeadingNumber(getSpecValue(b, SPEC_LABEL_TEMPERATURA)) ?? 0) - (parseLeadingNumber(getSpecValue(a, SPEC_LABEL_TEMPERATURA)) ?? 0)
      ));
      const values = {};
      for (const label of varyingLabels) {
        if (label.toLowerCase() === SPEC_LABEL_POTENCIA) { values[label] = row.potenciaValor; continue; }
        values[label] = items.map((p) => getSpecValue(p, label.toLowerCase())).find(Boolean) || '';
      }
      // Temperatura y color de luz van pegados (el color se deriva de "Tipo
      // de Luz", que es el mismo dato que Temperatura pero en palabras) - se
      // filtran juntos para que el punto de color quede alineado con su
      // temperatura, no con el indice del SKU.
      const temperaturaEntries = items
        .map((p) => {
          const temperatura = getSpecValue(p, SPEC_LABEL_TEMPERATURA);
          const colorLuz = resolveLuzColorFromKelvin(temperatura) || resolveLuzColor(getSpecValue(p, SPEC_LABEL_HIDDEN));
          return { temperatura, colorLuz };
        })
        .filter((entry) => entry.temperatura);
      return {
        skus: items.map((p) => p.sku).filter(Boolean),
        temperaturas: temperaturaEntries.map((entry) => entry.temperatura),
        coloresLuz: temperaturaEntries.map((entry) => entry.colorLuz),
        values,
        // Cada Potencia tiene su propio PDF (distinto SKU = misma ficha
        // dentro de una fila, ej. 3100/3101/3102 comparten el PDF de 12W) -
        // el boton de descarga va por fila, no una vez arriba de toda la
        // tarjeta.
        fichaTecnicaUrl: items.map((p) => p.fichaTecnicaUrl).find(Boolean) || null
      };
    });

  // Galeria (instalacion, detalle, empaque): administrable desde Power Admin
  // > Faretto > Galeria de producto, por familia+modelo+producto principal
  // (no por SKU - le pertenece al "producto principal" de la ficha, no a
  // una variante puntual). Se busca por familyId+modelo+titulo - un mismo
  // Modelo puede agrupar varios productos principales fisicamente distintos
  // (ej. "Draco Sob" tiene Cuadrado, Cuadrado Blanco y Redondo, cada uno su
  // propia ficha/titulo), asi que el titulo es parte de la clave, no solo
  // el modelo. Se limita a 6 (tamaño fijo de la grilla).
  // La foto #1 de este arreglo hace doble funcion: es a la vez ficha.imagen
  // Y el primer casillero de la grilla - no se salta, "queda por defecto"
  // ahi. Mientras esta ficha no tenga fotos cargadas en el gestor nuevo
  // (todavia la mayoria del catalogo), el casillero #1 cae al "imagen" viejo
  // (por SKU, ver group.imagen) en vez de dejar la grilla entera vacia -
  // antes ese fallback solo alimentaba el encabezado grande, que ahora esta
  // oculto (ver SHOW_HEADER_PHOTO en ProductCard.jsx), asi que sin este
  // fallback la grilla se quedaba sin ninguna foto.
  const galeriaKey = `${group.familyId}::${normalizeForKey(group.modelo)}::${normalizeForKey(group.titulo)}`;
  const galeriaDelModelo = galeriaByKey.get(galeriaKey) || [];
  const galeria = (galeriaDelModelo.length > 0 ? galeriaDelModelo : [group.imagen].filter(Boolean)).slice(0, 6);

  return {
    ...group,
    sharedSpecs,
    columns: varyingLabels,
    hasTemperatura: members.some((product) => getSpecValue(product, SPEC_LABEL_TEMPERATURA)),
    rows,
    skuCount: members.length,
    imagen: galeria[0] || group.imagen,
    galeria
  };
}

// galeriaGrupos: [{familia, modelo, productoPrincipal, fotos}] desde
// /api/public/faretto-galeria (ver fetchFarettoGaleria) - se arma una sola
// vez como lookup por familyId+modelo+productoPrincipal, misma clave
// (familyId+modelo+titulo) que usa cada ficha.
function buildGaleriaLookup(galeriaGrupos = []) {
  const byKey = new Map();
  for (const { familia, modelo, productoPrincipal, fotos } of galeriaGrupos) {
    byKey.set(`${familia}::${normalizeForKey(modelo)}::${normalizeForKey(productoPrincipal)}`, fotos || []);
  }
  return byKey;
}

export function buildProductGroups(productos = [], galeriaGrupos = []) {
  const galeriaByKey = buildGaleriaLookup(galeriaGrupos);
  const groups = new Map();

  for (const product of productos) {
    const family = resolveFamily(product.nombre);
    const modelo = resolveModelo(product.nombre);
    let titulo;
    let genericBase = null;
    if (modelo) {
      const nombreSinModelo = product.nombre.replace(MODELO_RULE, '').trim();
      genericBase = stripVariantWords(nombreSinModelo) || nombreSinModelo;
      // El modelo ya se muestra aparte (barra superior de la ficha /
      // breadcrumb de CategoryPage) - repetirlo en el titulo de cada tarjeta
      // es redundante, sobre todo cuando un modelo agrupa varias tarjetas
      // (una por forma/color) bajo la misma barra "Modelo X".
      titulo = genericBase;
    } else {
      titulo = product.nombre;
    }
    const key = modelo
      ? `${family.id}::${normalizeForKey(modelo)}::${normalizeForKey(genericBase)}`
      : `solo::${product.id}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        familyId: family.id,
        modelo,
        titulo,
        imagen: product.imagen,
        members: []
      });
    }
    groups.get(key).members.push(product);
  }

  return [...groups.values()].map((group) => buildFichaFromGroup(group, galeriaByKey));
}
