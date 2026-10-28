import * as data from './data.js';

// Para cada ruta (ver src/lib/routes.js): datos que necesita el render,
// estado HTTP (404 real si no existe) y <head> propio (title, description,
// canonical, Open Graph y datos estructurados schema.org).
// Todo lo que va en el <head> sale de lo mismo que la pagina muestra: no hay
// contenido "solo para buscadores".

export const SITE_URL = (process.env.SITE_URL || 'https://www.faretto.cl').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/assets/logo-faretto.webp`;
const ORG_ID = 'https://www.powerenergy.cl/#organization';
const BRAND = { '@type': 'Brand', '@id': 'https://www.powerenergy.cl/#faretto', name: 'Faretto' };
const DISTRIBUIDOR = 'Power Energy, distribuidor autorizado Faretto en Chile.';

const unique = (values) => [...new Set(values.filter(Boolean))];
const truncate = (text, max = 300) => (text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : text);
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const specOf = (product, label) => (product.specs || []).find((spec) => spec.label.toLowerCase() === label)?.valor;

function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Inicio', path: '/' }, ...items].map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}`
    }))
  };
}

function productGroupLd(ficha, { ssr, modelo, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    name: `${ficha.titulo} Faretto ${modelo}`,
    productGroupID: ficha.key,
    brand: BRAND,
    url,
    image: ficha.galeria?.length ? ficha.galeria : undefined,
    additionalProperty: ficha.sharedSpecs.map((spec) => ({ '@type': 'PropertyValue', name: spec.label, value: ssr.cleanSpecValue(spec.label, spec.valor) })),
    hasVariant: ficha.members.map((product) => ({
      '@type': 'Product',
      sku: product.sku,
      name: product.nombre,
      brand: BRAND,
      image: product.imagen || undefined,
      additionalProperty: (product.specs || [])
        .filter((spec) => spec.valor && !/^\*+$/.test(spec.valor))
        .map((spec) => ({ '@type': 'PropertyValue', name: spec.label, value: ssr.cleanSpecValue(spec.label, spec.valor) }))
    }))
  };
}

// -> { status, initialData, head: { title, description, image, type, robots, jsonLd } }
export async function loadPage(route, ssr) {
  const nombres = await data.getNombres();
  if (nombres) ssr.applyFarettoNombres(nombres);
  const initialData = nombres ? { nombres } : {};
  const notFound = () => ({
    status: 404,
    initialData,
    head: { title: ssr.pageTitle({ name: 'notFound' }), description: 'La página que buscas no existe.', robots: 'noindex' }
  });

  if (route.name === 'notFound') return notFound();

  const needsCatalog = ['home', 'catalogo', 'familia', 'modelo', 'lumex', 'precioLista'].includes(route.name);
  if (needsCatalog) {
    const [productos, galeria] = await Promise.all([data.getProductos(), data.getGaleria()]);
    if (productos) initialData.productos = productos;
    if (galeria) initialData.galeria = galeria;
  }
  const productos = initialData.productos;

  switch (route.name) {
    case 'home': {
      const [blogPosts, homeLayout] = await Promise.all([data.getBlogPosts(), data.getHomeLayout()]);
      if (blogPosts) initialData.blogPosts = blogPosts;
      if (homeLayout?.length) initialData.homeLayout = homeLayout;
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'home' }),
          description: `Iluminación técnica Faretto en Chile: plafones, paneles LED, luminaria pública, proyectores, campanas industriales y cintas LED con ficha técnica. ${DISTRIBUIDOR}`
        }
      };
    }

    case 'catalogo': {
      const familias = productos ? unique(productos.map((p) => ssr.resolveFamily(p.nombre).label)) : [];
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'catalogo' }),
          description: truncate(`Catálogo completo Faretto${productos ? ` con ${productos.length} productos` : ''}: ${familias.join(', ') || 'plafones, paneles LED, luminaria pública y más'}. Fichas técnicas descargables. ${DISTRIBUIDOR}`),
          jsonLd: [breadcrumb([{ name: 'Catálogo', path: '/catalogo' }])]
        }
      };
    }

    case 'familia': {
      const family = ssr.FAMILIES.find((f) => f.id === route.familia);
      const members = productos?.filter((p) => ssr.resolveFamily(p.nombre).id === route.familia);
      if (members && members.length === 0) return notFound();
      const modelos = members ? unique(members.map((p) => ssr.resolveModelo(p.nombre))) : [];
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'familia', familia: family.label }),
          description: truncate(`${family.label} Faretto${members ? `: ${members.length} productos` : ''}${modelos.length ? ` en los modelos ${modelos.join(', ')}` : ''}. Potencias, temperaturas de color, medidas y ficha técnica. ${DISTRIBUIDOR}`),
          image: members?.find((p) => p.imagen)?.imagen,
          jsonLd: [breadcrumb([{ name: 'Catálogo', path: '/catalogo' }, { name: family.label, path: route.pathname }])]
        }
      };
    }

    case 'modelo': {
      const family = ssr.FAMILIES.find((f) => f.id === route.familia);
      if (!productos) {
        return { status: 200, initialData, head: { title: `${family.label} Faretto — Ficha técnica`, description: DISTRIBUIDOR } };
      }
      const members = productos.filter((p) => ssr.resolveFamily(p.nombre).id === route.familia && ssr.modeloSlug(p.nombre) === route.modelo);
      if (members.length === 0) return notFound();
      const modelo = ssr.resolveModelo(members[0].nombre);
      const fichas = ssr.buildProductGroups(members, initialData.galeria || []);
      const potencias = unique(members.map((p) => specOf(p, 'potencia')?.toUpperCase()));
      const temperaturas = unique(members.map((p) => specOf(p, 'temperatura')));
      const url = `${SITE_URL}${route.pathname}`;
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'modelo', familia: family.label, modelo }),
          description: truncate(`${ssr.modeloHeading(family.label, modelo)}: ${unique(fichas.map((f) => f.titulo)).join(', ')}.${potencias.length ? ` Potencias ${potencias.join(', ')}.` : ''}${temperaturas.length ? ` Temperaturas ${temperaturas.join(', ')}.` : ''} SKU ${members.map((p) => p.sku).join(', ')}. Ficha técnica descargable. ${DISTRIBUIDOR}`),
          image: fichas.find((f) => f.imagen)?.imagen,
          type: 'product',
          jsonLd: [
            breadcrumb([{ name: 'Catálogo', path: '/catalogo' }, { name: family.label, path: `/catalogo/${route.familia}` }, { name: `Modelo ${modelo}`, path: route.pathname }]),
            ...fichas.map((ficha) => productGroupLd(ficha, { ssr, modelo, url }))
          ]
        }
      };
    }

    case 'lumex':
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'lumex' }),
          description: `Línea Lumex dentro del catálogo Faretto: campanas industriales, paneles LED y equipos estancos con ficha técnica. ${DISTRIBUIDOR}`,
          jsonLd: [breadcrumb([{ name: 'Lumex', path: route.pathname }])]
        }
      };

    case 'precioLista':
      return {
        status: 200,
        initialData,
        head: { title: ssr.pageTitle({ name: 'precioLista' }), description: `Lista de precios del catálogo Faretto por familia. ${DISTRIBUIDOR}` }
      };

    case 'blog': {
      const blogPosts = await data.getBlogPosts();
      if (blogPosts) initialData.blogPosts = blogPosts;
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'blog' }),
          description: 'Artículos sobre iluminación LED: normativa (DS1), temperatura de color, CRI, luminaria antiexplosiva, campanas industriales y más.',
          jsonLd: [breadcrumb([{ name: 'Blog', path: '/blog' }])]
        }
      };
    }

    case 'blogPost': {
      const post = await data.getBlogPost(route.slug);
      if (post === null) {
        initialData.blogPost = { slug: route.slug, notFound: true };
        return notFound();
      }
      if (!post) return { status: 200, initialData, head: { title: 'Blog — Faretto', description: '' } };
      initialData.blogPost = post;
      const description = truncate(post.seo_description || post.resumen || stripHtml(post.contenido_html), 300);
      return {
        status: 200,
        initialData,
        head: {
          title: post.seo_title || ssr.pageTitle({ name: 'blogPost', titulo: post.titulo }),
          description,
          image: post.imagen_url,
          type: 'article',
          jsonLd: [
            breadcrumb([{ name: 'Blog', path: '/blog' }, { name: post.titulo, path: route.pathname }]),
            {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.titulo,
              description,
              image: post.imagen_url || undefined,
              datePublished: post.fecha_publicacion || undefined,
              dateModified: post.fecha_modificacion || post.fecha_publicacion || undefined,
              author: post.autor?.nombre ? { '@type': 'Person', name: post.autor.nombre } : { '@id': ORG_ID },
              publisher: { '@id': ORG_ID },
              mainEntityOfPage: `${SITE_URL}${route.pathname}`,
              about: BRAND,
              inLanguage: 'es-CL'
            }
          ]
        }
      };
    }

    case 'pagina': {
      const pagina = await data.getPagina(route.slug);
      if (pagina === null) {
        initialData.pagina = { slug: route.slug, notFound: true };
        return notFound();
      }
      if (!pagina) return { status: 200, initialData, head: { title: 'Faretto', description: '' } };
      initialData.pagina = pagina;
      return {
        status: 200,
        initialData,
        head: {
          title: pagina.seo_title || ssr.pageTitle({ name: 'pagina', titulo: pagina.titulo }),
          description: truncate(pagina.seo_description || pagina.resumen || stripHtml(pagina.contenido_html)),
          image: pagina.imagen_url,
          jsonLd: [breadcrumb([{ name: pagina.titulo, path: route.pathname }])]
        }
      };
    }

    case 'distribuidores': {
      const distribuidores = await data.getDistribuidores();
      if (distribuidores) initialData.distribuidores = distribuidores;
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'distribuidores' }),
          description: 'Distribuidores autorizados Faretto en Chile, por zona: dónde comprar iluminación Faretto con respaldo técnico y productos originales.',
          jsonLd: [
            breadcrumb([{ name: 'Distribuidores', path: '/distribuidores' }]),
            ...(distribuidores?.length ? [{
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Distribuidores autorizados Faretto',
              itemListElement: distribuidores.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Organization',
                  name: item.nombre,
                  address: item.direccion || undefined,
                  telephone: item.telefono || undefined,
                  email: item.email || undefined,
                  areaServed: item.zona || undefined
                }
              }))
            }] : [])
          ]
        }
      };
    }

    case 'contacto':
      return {
        status: 200,
        initialData,
        head: {
          title: ssr.pageTitle({ name: 'contacto' }),
          description: `Cotiza iluminación Faretto: ventas al por mayor, proyectos y soporte técnico. ${DISTRIBUIDOR}`
        }
      };

    default:
      return notFound();
  }
}

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// JSON dentro de <script>: "<" escapado para que un "</script>" en el
// contenido (ej. HTML de un articulo) no cierre la etiqueta antes de tiempo.
export const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export function headTags(head, canonicalPath) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  const image = head.image || DEFAULT_IMAGE;
  const tags = [
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    head.robots ? `<meta name="robots" content="${escapeAttr(head.robots)}" />` : null,
    `<meta property="og:site_name" content="Faretto" />`,
    `<meta property="og:locale" content="es_CL" />`,
    `<meta property="og:type" content="${head.type === 'article' ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${escapeAttr(head.title)}" />`,
    head.description ? `<meta property="og:description" content="${escapeAttr(head.description)}" />` : null,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...(head.jsonLd || []).map((ld) => `<script type="application/ld+json">${safeJson(ld)}</script>`)
  ];
  return tags.filter(Boolean).join('\n    ');
}
