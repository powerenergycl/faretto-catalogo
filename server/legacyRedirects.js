// Redirecciones 301 de las URLs del sitio WordPress anterior de faretto.cl
// (paginas, /category/, /tag/, /fichas/*.pdf, /lista-precios) a su equivalente
// en el catalogo actual. Google todavia las muestra en resultados (Search
// Console, 2025-07 a 2026-10: 135 rutas con impresiones); sin redireccion
// daban 404 y ese posicionamiento se perdia.
//
// Lo que ya no tiene equivalente en el catalogo (focos de piscina,
// fotoceldas, convenio marco, etc.) queda fuera a proposito: mandarlo a una
// pagina sin ese producto es un "soft 404" para Google. Esas siguen en 404.

// Rutas exactas (sin barra final, en minusculas).
const EXACT = {
  '/plafones-led': '/catalogo/plafones',
  '/luminarias-publicas-led': '/catalogo/luminaria-publica',
  // En el WordPress, "luminarias" era la categoria de alumbrado publico
  // (sus hijas eran Fotoceldas y Brisa).
  '/category/luminarias': '/catalogo/luminaria-publica',
  '/paneles-led': '/catalogo/paneles-led',
  // La mayoria de lo solar del catalogo son proyectores solares Modelo Rigel.
  '/iluminacion-solar': '/catalogo/proyectores/rigel',
  '/nuestros-distribuidores': '/distribuidores',
  '/proyectores-led': '/catalogo/proyectores',
  '/proyectores-led-alta-potencia': '/catalogo/proyectores',
  '/campanas-led-2': '/catalogo/campanas-led',
  '/categorias': '/catalogo',
  '/focos-sobrepuestos-led': '/catalogo/focos',
  '/focos-embutidos': '/catalogo/focos',
  '/foco-riel': '/catalogo/focos',
  '/focos-para-riel-led': '/catalogo/focos',
  '/tubos-led': '/catalogo/tubos',
  '/apliques-exteriores': '/catalogo/apliques',
  '/colgantes-decorativos': '/catalogo/colgantes',
  '/lamparas-colgante-led': '/catalogo/colgantes',
  '/ampolletas-led': '/catalogo/ampolletas-bases',
  '/emergencia-y-seguridad': '/catalogo/equipos-emergencia',
  '/lista-precios': '/precio-lista'
};

// Para /category/, /tag/ y /fichas/: primera regla que calce con el texto de
// la ruta. Orden de mas especifico a mas general.
const RULES = [
  [/piscina|pileta|fotocelda|frameless|cil[ií]ndric|escalera|jard[ií]n|brisa|orion|sirio|outlux/, null],
  [/plafon.*sobrepuest/, '/catalogo/plafones/draco-sob'],
  [/plafon.*embutid/, '/catalogo/plafones/draco'],
  [/downlight|dolwnlight/, '/catalogo/plafones/kraz'],
  [/plafon/, '/catalogo/plafones'],
  [/luminaria.?publica|iluminacion.?vial/, '/catalogo/luminaria-publica'],
  [/panel/, '/catalogo/paneles-led'],
  [/colgante.?lineal/, '/catalogo/colgantes/spica'],
  [/colgante/, '/catalogo/colgantes'],
  [/campana|ufo|galpon|industrial/, '/catalogo/campanas-led'],
  [/canopus/, '/catalogo/proyectores/canopus'],
  [/proyector|polux|portatil/, '/catalogo/proyectores'],
  [/estanco/, '/catalogo/antiexplosivos-estancos'],
  [/emergencia/, '/catalogo/equipos-emergencia'],
  [/t5/, '/catalogo/tubos/kaus'],
  [/tubo/, '/catalogo/tubos'],
  [/tortuga|ovalado/, '/catalogo/focos/deneb'],
  [/aplique/, '/catalogo/apliques'],
  [/ampolleta/, '/catalogo/ampolletas-bases'],
  [/foco|riel|dicroico|sobrepuesto|embutido|\bcob\b/, '/catalogo/focos'],
  [/luminaria/, '/catalogo']
];

const LEGACY_PREFIX = /^\/(category|tag|fichas)\//;

export function legacyRedirectTarget(rawPath = '') {
  let path;
  try {
    path = decodeURIComponent(rawPath);
  } catch {
    path = rawPath;
  }
  path = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (EXACT[path]) return EXACT[path];
  if (!LEGACY_PREFIX.test(path)) return null;

  const text = path.replace(/[_\-./%]+/g, ' ');
  for (const [test, target] of RULES) {
    if (test.test(text)) return target;
  }
  return null;
}
