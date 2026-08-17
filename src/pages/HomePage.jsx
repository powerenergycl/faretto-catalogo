import { useEffect, useState } from 'react';
import { Image, Newspaper } from 'lucide-react';
import { fetchFarettoAccesos, FAMILIES, resolveFamily } from '../lib/api.js';
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
// sitio_power (1 ancho 2:1 + verticales 3:4 + cuadrados 1:1). Sin imagenes
// propias todavia (faretto-catalogo no tiene CMS de banners) - cada entrada
// queda lista para recibir "imagen" + "href" reales sin tocar el layout.
const BANNERS = [
  { zone: 'wide', href: '/catalogo', imagen: null },
  { zone: 'vertical', href: '/catalogo?familia=paneles-led', imagen: null },
  { zone: 'vertical', href: '/catalogo?familia=plafones', imagen: null },
  { zone: 'square', href: null, imagen: null },
  { zone: 'square', href: null, imagen: null },
  { zone: 'square', href: null, imagen: null },
  { zone: 'square', href: null, imagen: null }
];

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

function BannerTile({ zone, href, imagen }) {
  const content = imagen
    ? <img src={imagen} alt="" loading="lazy" />
    : (
      <span className="placeholder">
        <Image size={20} />
        Banner pendiente
      </span>
    );

  return href
    ? <a className={`home-banner-tile ${zone}`} href={href}>{content}</a>
    : <div className={`home-banner-tile ${zone}`}>{content}</div>;
}

export function HomePage({ productos, dataStatus = 'ready', onNavigate }) {
  const [accesos, setAccesos] = useState(null); // null = todavia no respondio

  useEffect(() => {
    let cancelled = false;
    fetchFarettoAccesos()
      .then((items) => { if (!cancelled) setAccesos(items); })
      .catch(() => { if (!cancelled) setAccesos([]); });
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

      <div className="home-seo-intro">
        <h1>Iluminación técnica Faretto en Chile</h1>
        <p>
          Catálogo Faretto disponible en Power Energy: plafones, paneles LED, luminaria pública y cintas LED
          con ficha técnica, stock y despacho a todo Chile.
        </p>
      </div>

      {/* ---- banners ---- */}
      <div className="home-section-heading">
        <h2>Novedades</h2>
        <p>Banners a definir — estructura lista para recibir imágenes.</p>
      </div>
      <div className="home-banner-mosaic">
        {BANNERS.map((banner, index) => (
          <BannerTile key={index} {...banner} />
        ))}
      </div>

      {/* ---- blog ---- */}
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
