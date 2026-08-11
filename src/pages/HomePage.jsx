import {
  Lightbulb, MapPin, Cable, LayoutGrid, Flashlight, Zap,
  LayoutList, MessageCircle, Building2, Image, Newspaper
} from 'lucide-react';
import { FAMILIES, resolveFamily } from '../lib/api.js';

// Un producto de muestra por familia para el thumbnail circular - toma el
// primero que matchee en la lista ya cargada, así no depende de imagenes
// fijas en el repo ni de un endpoint aparte.
function pickFamilyThumbnails(productos) {
  return FAMILIES.map((family) => {
    const sample = productos.find((product) => resolveFamily(product.nombre).id === family.id && product.imagen);
    const count = productos.filter((product) => resolveFamily(product.nombre).id === family.id).length;
    return { ...family, imagen: sample?.imagen || null, count };
  });
}

// 9 accesos (grilla 3x3): las 6 familias del catálogo + 3 atajos generales.
// Textos/orden son un borrador razonable, no lo definido en papel todavía -
// se pueden reemplazar sin tocar la grilla ni el layout.
const QUICKLINKS = [
  { icon: Lightbulb, label: 'Plafones', href: '/catalogo?familia=plafones' },
  { icon: MapPin, label: 'Luminaria pública', href: '/catalogo?familia=luminaria-publica' },
  { icon: Cable, label: 'Cintas LED', href: '/catalogo?familia=cintas-led' },
  { icon: LayoutGrid, label: 'Paneles LED', href: '/catalogo?familia=paneles-led' },
  { icon: Flashlight, label: 'Focos', href: '/catalogo?familia=focos' },
  { icon: Zap, label: 'Tubos y otros', href: '/catalogo?familia=tubos' },
  { icon: LayoutList, label: 'Catálogo completo', href: '/catalogo' },
  { icon: MessageCircle, label: 'Cotizar por WhatsApp', href: 'https://wa.me/', external: true },
  { icon: Building2, label: 'Power Energy', href: 'https://powerenergy.cl', external: true }
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

function QuickLink({ icon: Icon, label, href, external, onNavigate }) {
  return (
    <a
      className="home-quicklink"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={external ? undefined : (event) => { event.preventDefault(); onNavigate(href); }}
    >
      <Icon size={18} />
      <span>{label}</span>
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
  const familyThumbnails = pickFamilyThumbnails(productos);
  // La franja de familias depende del feed de productos (imagen + conteo
  // por familia) - si todavia no respondio o fallo, se omite en vez de
  // mostrar circulos vacios con "(0)".
  const showFamilyStrip = dataStatus === 'ready' && productos.length > 0;

  return (
    <>
      {/* ---- accesos destacados ---- */}
      <div className="home-section-heading">
        <h2>Accesos destacados</h2>
      </div>
      <div className="home-quicklinks">
        {QUICKLINKS.map((link) => (
          <QuickLink key={link.label} {...link} onNavigate={onNavigate} />
        ))}
      </div>

      {showFamilyStrip && (
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
