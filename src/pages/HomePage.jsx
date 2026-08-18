import { useEffect, useState } from 'react';
import { ImageOff, Newspaper } from 'lucide-react';
import { fetchFarettoAccesos, fetchFarettoHomeLayout, FARETTO_HOME_LAYOUT_DEFAULT, FAMILIES, resolveFamily, cleanSpecValue } from '../lib/api.js';
import { AccessIcon } from '../lib/accessIcons.jsx';

// Accesos directos (franja de circulos con conteo por familia, debajo de los
// 9 botones) - pedido explicito: ocultar por ahora, se retoma mas adelante.
// No se borro el codigo que los arma (mas abajo, sin usar) para no perder el
// trabajo cuando se reactiven.
const SHOW_ACCESOS_DIRECTOS = false;

// Accesos destacados (grilla 3x3): ahora administrables desde sitio_power
// (Power Admin > sitio Faretto > Accesos destacados). Esta lista fija es
// solo el respaldo mientras no haya ninguno cargado ahi, o si el fetch
// falla - la seccion nunca debe quedar vacia.
// Nombres en kebab-case: mismo formato que usa el admin (ver
// src/lib/accessIcons.js y https://lucide.dev/icons).
const FALLBACK_QUICKLINKS = [
  { nombre: 'Plafones', icono: 'lightbulb', url_destino: '/catalogo?familia=plafones' },
  { nombre: 'Luminaria pública', icono: 'map-pin', url_destino: '/catalogo?familia=luminaria-publica' },
  { nombre: 'Cintas LED', icono: 'cable', url_destino: '/catalogo?familia=cintas-led' },
  { nombre: 'Paneles LED', icono: 'layout-grid', url_destino: '/catalogo?familia=paneles-led' },
  { nombre: 'Focos', icono: 'flashlight', url_destino: '/catalogo?familia=focos' },
  { nombre: 'Tubos y otros', icono: 'zap', url_destino: '/catalogo?familia=tubos' },
  { nombre: 'Catálogo completo', icono: 'layout-list', url_destino: '/catalogo' },
  { nombre: 'Cotizar por WhatsApp', icono: 'message-circle', url_destino: 'https://wa.me/' },
  { nombre: 'Power Energy', icono: 'building-2', url_destino: 'https://powerenergy.cl' }
];

// Mosaico de banners: mismo lenguaje de zonas que home-banner-mosaic en
// sitio_power (1 ancho 2:1 + verticales 3:4 + cuadrados 1:1). Sin CMS de
// banners todavia (viene mas adelante, administrable desde Power Admin) -
// mientras tanto se rellena con productos reales del catalogo (foto +
// nombre + atributos, sin precio) en vez de dejar casilleros vacios. Cuando
// el admin de imagenes este listo, este mosaico se reemplaza por imagenes
// reales cargadas ahi sin tocar el layout (misma lista de zonas).
const BANNER_ZONES = ['wide', 'vertical', 'vertical', 'square', 'square', 'square', 'square'];

// Especificaciones mas relevantes para mostrar en la tarjeta (sin precio) -
// mismo orden de prioridad que usa la ficha de producto (Potencia primero).
const FEATURED_SPEC_PRIORITY = ['potencia', 'lúmenes', 'lumenes', 'temperatura'];

function isMaskedValue(valor = '') {
  return /^\*+$/.test(String(valor || '').trim());
}

function pickTopSpecs(specs = [], max = 2) {
  return [...specs]
    .filter((spec) => spec.valor && !isMaskedValue(spec.valor))
    .sort((a, b) => {
      const ai = FEATURED_SPEC_PRIORITY.indexOf(a.label.toLowerCase());
      const bi = FEATURED_SPEC_PRIORITY.indexOf(b.label.toLowerCase());
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, max);
}

// Selecciona productos con foto, dando una vuelta por familia antes de
// repetir (round-robin) para que el mosaico no quede lleno de variantes de
// un mismo modelo - simple variedad visual mientras esto es contenido de
// relleno, no hace falta mas que eso.
function pickFeaturedProducts(productos = [], count) {
  const byFamily = new Map();
  for (const product of productos) {
    if (!product.imagen) continue;
    const familyId = resolveFamily(product.nombre).id;
    if (!byFamily.has(familyId)) byFamily.set(familyId, []);
    byFamily.get(familyId).push(product);
  }
  const families = [...byFamily.keys()];
  const picked = [];
  for (let round = 0; picked.length < count && families.some((id) => byFamily.get(id)[round]); round++) {
    for (const familyId of families) {
      if (picked.length >= count) break;
      const candidate = byFamily.get(familyId)[round];
      if (candidate) picked.push(candidate);
    }
  }
  return picked;
}

// Sin fuente de datos de blog todavia (faretto-catalogo no expone /blog) -
// se deja la grilla de 5 lista para mapear articulos reales mas adelante.
const BLOG_PLACEHOLDER_COUNT = 5;

function QuickLink({ nombre, icono, url_destino, onNavigate }) {
  const external = /^https?:\/\//i.test(url_destino || '');
  return (
    <a
      className="home-quicklink"
      href={url_destino || '#'}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={external ? undefined : (event) => { event.preventDefault(); onNavigate(url_destino); }}
    >
      <AccessIcon name={icono} size={18} />
      <span>{nombre}</span>
    </a>
  );
}

function ProductBannerTile({ zone, product, onNavigate }) {
  if (!product) {
    return (
      <div className={`home-banner-tile ${zone}`}>
        <span className="placeholder">
          <ImageOff size={20} />
          Banner pendiente
        </span>
      </div>
    );
  }

  const href = `/catalogo?familia=${resolveFamily(product.nombre).id}`;
  const topSpecs = pickTopSpecs(product.specs);

  return (
    <a
      className={`home-banner-tile has-product ${zone}`}
      href={href}
      onClick={(event) => { event.preventDefault(); onNavigate(href); }}
    >
      {product.imagen ? <img src={product.imagen} alt={product.nombre} loading="lazy" /> : <ImageOff size={22} />}
      <div className="home-banner-product-caption">
        <strong>{product.nombre}</strong>
        {topSpecs.length > 0 && (
          <div className="home-banner-product-specs">
            {topSpecs.map((spec) => <span key={spec.label}>{cleanSpecValue(spec.label, spec.valor)}</span>)}
          </div>
        )}
      </div>
    </a>
  );
}

function SeoIntroSection() {
  return (
    <div className="home-seo-intro">
      <h1>Iluminación técnica Faretto en Chile</h1>
      <p>
        Catálogo Faretto disponible en Power Energy: plafones, paneles LED, luminaria pública y cintas LED
        con ficha técnica, stock y despacho a todo Chile.
      </p>
    </div>
  );
}

function BannersSection({ productos = [], onNavigate }) {
  const featured = pickFeaturedProducts(productos, BANNER_ZONES.length);
  return (
    <>
      <div className="home-section-heading">
        <h2>Novedades</h2>
        <p>Selección del catálogo — sección en desarrollo, pronto con gráficas propias.</p>
      </div>
      <div className="home-banner-mosaic">
        {BANNER_ZONES.map((zone, index) => (
          <ProductBannerTile key={featured[index]?.id ?? index} zone={zone} product={featured[index]} onNavigate={onNavigate} />
        ))}
      </div>
    </>
  );
}

function BlogSection() {
  return (
    <>
      <div className="home-section-heading">
        <h2>Del blog</h2>
        <p>Artículos a definir — estructura lista para recibir contenido.</p>
      </div>
      <div className="home-blog-grid">
        {Array.from({ length: BLOG_PLACEHOLDER_COUNT }).map((_, index) => (
          <article className="home-blog-card" key={index}>
            <div className="home-blog-thumb"><Newspaper size={22} /></div>
            <div className="home-blog-body">
              <span>Blog</span>
              <strong>Artículo pendiente</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

// Secciones reordenables desde Power Admin > sitio Faretto > Orden del Home
// (ver fetchFarettoHomeLayout). "Accesos destacados" y, si se reactiva,
// "Accesos directos" no estan aca a proposito: van siempre primero, fijas.
const HOME_SECTIONS = {
  'seo-intro': SeoIntroSection,
  banners: BannersSection,
  blog: BlogSection
};

export function HomePage({ productos, dataStatus = 'ready', onNavigate }) {
  const [accesos, setAccesos] = useState(null); // null = todavia no respondio
  const [sectionOrder, setSectionOrder] = useState(FARETTO_HOME_LAYOUT_DEFAULT);

  useEffect(() => {
    let cancelled = false;
    fetchFarettoAccesos()
      .then((items) => { if (!cancelled) setAccesos(items); })
      .catch(() => { if (!cancelled) setAccesos([]); });
    fetchFarettoHomeLayout()
      .then((orden) => { if (!cancelled) setSectionOrder(orden); })
      .catch(() => {}); // ya arranca con el default, no hace falta setear nada
    return () => { cancelled = true; };
  }, []);

  const quicklinks = accesos && accesos.length > 0 ? accesos : FALLBACK_QUICKLINKS;

  return (
    <>
      {/* ---- accesos destacados ---- */}
      <div className="home-section-heading">
        <h2>Accesos destacados</h2>
      </div>
      <div className="home-quicklinks">
        {quicklinks.map((link) => (
          <QuickLink key={link.nombre} {...link} onNavigate={onNavigate} />
        ))}
      </div>

      {SHOW_ACCESOS_DIRECTOS && (
        <FamilyStrip productos={productos} dataStatus={dataStatus} onNavigate={onNavigate} />
      )}

      {sectionOrder.map((sectionId) => {
        const Section = HOME_SECTIONS[sectionId];
        return Section ? <Section key={sectionId} productos={productos} onNavigate={onNavigate} /> : null;
      })}
    </>
  );
}

// Franja de circulos con conteo por familia (ver SHOW_ACCESOS_DIRECTOS) -
// depende de FAMILIES/resolveFamily y del feed de productos ya cargado, sin
// import aparte. Se separo a su propio componente para que quede fuera del
// camino cuando esta apagada, sin tener que borrarla.
function FamilyStrip({ productos, dataStatus, onNavigate }) {
  const showFamilyStrip = dataStatus === 'ready' && productos.length > 0;
  if (!showFamilyStrip) return null;

  const familyThumbnails = FAMILIES.map((family) => {
    const sample = productos.find((product) => resolveFamily(product.nombre).id === family.id && product.imagen);
    const count = productos.filter((product) => resolveFamily(product.nombre).id === family.id).length;
    return { ...family, imagen: sample?.imagen || null, count };
  });

  return (
    <div className="round-category-strip">
      {familyThumbnails.map((family) => (
        <a
          key={family.id}
          className="round-category"
          href={`/catalogo?familia=${family.id}`}
          onClick={(event) => { event.preventDefault(); onNavigate(`/catalogo?familia=${family.id}`); }}
        >
          <span>
            {family.imagen ? <img src={family.imagen} alt={family.label} /> : null}
          </span>
          <strong>{family.label} ({family.count})</strong>
        </a>
      ))}
    </div>
  );
}
