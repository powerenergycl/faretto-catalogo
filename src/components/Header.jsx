import { useEffect, useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { fetchFarettoMenu } from '../lib/api.js';

// Solo 2 rutas reales por ahora (Home y Catalogo, por eso el pedido
// original) - los demas links de familia navegan a /catalogo con el filtro
// ya aplicado, no a paginas propias.
// Respaldo mientras no haya nada cargado en el admin (Power Admin > sitio
// Faretto > Menu principal), o si el fetch falla - la barra nunca debe
// quedar vacia.
const FALLBACK_NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo completo' },
  { href: '/catalogo?familia=plafones', label: 'Plafones' },
  { href: '/catalogo?familia=luminaria-publica', label: 'Luminaria pública' },
  { href: '/catalogo?familia=paneles-led', label: 'Paneles LED' }
];

// menu_principal guarda "url" tal cual lo escribio el admin, sin garantia de
// "/" inicial para rutas internas (ver ejemplo real: "categorias" en vez de
// "/categorias"). externo === abre pestana nueva; para el resto se detecta
// por prefijo http igual que en los accesos destacados.
function normalizeMenuItem({ etiqueta, url, tipo }) {
  const raw = String(url || '').trim();
  const external = tipo === 'externo' || /^https?:\/\//i.test(raw);
  const href = external || raw.startsWith('/') ? raw : `/${raw}`;
  return { label: etiqueta, href, external };
}

// Umbral de scroll para pasar de header teal (logo blanco) a header blanco
// (logo a color): >0 a proposito, no 0 - un scroll de 1-2px por rebote de
// trackpad/mouse-wheel en el tope de la pagina no debe alternar la clase
// ida y vuelta.
const SCROLL_SOLID_THRESHOLD = 24;

export function Header({ route, onNavigate }) {
  const [menuItems, setMenuItems] = useState(null); // null = todavia no respondio
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchFarettoMenu()
      .then((items) => { if (!cancelled) setMenuItems(items.map(normalizeMenuItem)); })
      .catch(() => { if (!cancelled) setMenuItems([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > SCROLL_SOLID_THRESHOLD);
    onScroll(); // por si la pagina carga ya scrolleada (ej. al volver con "atras")
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = menuItems && menuItems.length > 0 ? menuItems : FALLBACK_NAV_LINKS;

  return (
    <header className={`public-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="header-row">
        <a className="brand-logo" href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }}>
          <img className="brand-logo-white" src="/assets/logo-faretto-white.webp" alt="Faretto — Illuminazione e Design" />
          <img className="brand-logo-color" src="/assets/logo-faretto.webp" alt="" aria-hidden="true" />
        </a>
        <div className="public-search">
          <Search size={18} />
          <span>Buscar por modelo, SKU o familia</span>
        </div>
        <div className="header-icons">
          {/* Sin cuenta ni carrito propios: este sitio es catalogo, no
              ecommerce. El unico "CTA de conversion" es cotizar por WhatsApp. */}
          <a className="icon-btn" href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="Cotizar por WhatsApp">
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
      <nav className="public-nav">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noreferrer' : undefined}
            className={!link.external && (`${route.pathname}${route.search}` === link.href || (route.pathname === link.href && !route.search)) ? 'active' : ''}
            onClick={link.external ? undefined : (event) => { event.preventDefault(); onNavigate(link.href); }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
