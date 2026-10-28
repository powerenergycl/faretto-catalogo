import { FAMILIES, resolveFamily, resolveModelo, modeloSlug, slugify } from './catalog.js';

// Tabla unica de rutas del sitio: la usan App.jsx (navegador) y server.js
// (render del lado del servidor, 404 y redirecciones). Cualquier ruta nueva
// va aca, si no el servidor la responde como 404.

export const LUMEX_PATH = '/lumex';

export function familyPath(familyId) {
  return familyId ? `/catalogo/${familyId}` : '/catalogo';
}

// Productos sin "Modelo X" en el nombre no tienen pagina propia: quedan en la
// pagina de su familia.
export function productPath(product) {
  const familyId = resolveFamily(product.nombre).id;
  const slug = modeloSlug(product.nombre);
  return slug ? `/catalogo/${familyId}/${slug}` : familyPath(familyId);
}

const STATIC_ROUTES = {
  '/': 'home',
  '/catalogo': 'catalogo',
  [LUMEX_PATH]: 'lumex',
  '/blog': 'blog',
  '/distribuidores': 'distribuidores',
  '/contacto': 'contacto',
  '/precio-lista': 'precioLista'
};

export function parseRoute(rawPathname = '/') {
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, '') : rawPathname;
  if (STATIC_ROUTES[pathname]) return { name: STATIC_ROUTES[pathname], pathname };

  const catalogo = pathname.match(/^\/catalogo\/([^/]+)(?:\/([^/]+))?$/);
  if (catalogo) {
    const familia = decodeURIComponent(catalogo[1]);
    if (!FAMILIES.some((family) => family.id === familia)) return { name: 'notFound', pathname };
    return catalogo[2]
      ? { name: 'modelo', pathname, familia, modelo: decodeURIComponent(catalogo[2]) }
      : { name: 'familia', pathname, familia };
  }

  const blogPost = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogPost) return { name: 'blogPost', pathname, slug: decodeURIComponent(blogPost[1]) };

  // "/quienes-somos" es un alias directo del slug 'quienes-somos' en la
  // tabla de paginas -- asi calza con el boton ya existente en Accesos
  // Destacados (url_destino: "quienes-somos"). Cualquier otra pagina nueva
  // creada en el admin vive en /pagina/<slug>.
  if (pathname === '/quienes-somos') return { name: 'pagina', pathname, slug: 'quienes-somos' };
  const pagina = pathname.match(/^\/pagina\/([^/]+)$/);
  if (pagina) return { name: 'pagina', pathname, slug: decodeURIComponent(pagina[1]) };

  return { name: 'notFound', pathname };
}

// URLs viejas del catalogo con filtros en la query (?familia=, ?modelo=,
// ?marca=lumex) -> ruta limpia equivalente, o null si no aplica. El modelo
// viejo venia con el nombre a MOSTRAR, asi que se busca en el feed para dar
// con su slug real; sin feed se usa el slug del texto tal cual.
export function legacyCatalogPath(pathname, search, productos = []) {
  if (pathname.replace(/\/+$/, '') !== '/catalogo' || !search) return null;
  const params = new URLSearchParams(search);
  if (params.get('marca') === 'lumex') return LUMEX_PATH;
  const familia = params.get('familia');
  if (!familia) return null;
  const modelo = params.get('modelo');
  if (!modelo) return familyPath(familia);
  const match = productos.find((product) => (
    resolveFamily(product.nombre).id === familia && resolveModelo(product.nombre) === modelo
  ));
  return `/catalogo/${familia}/${match ? modeloSlug(match.nombre) : slugify(modelo)}`;
}
