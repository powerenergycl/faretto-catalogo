import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Menu, X, Lightbulb, MapPin, Cable, LayoutGrid, Flashlight, Zap, Boxes, Video, Bell, ShieldAlert, Lamp, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { fetchFarettoMenu, FAMILIES, resolveFamily, resolveModelo } from '../lib/api.js';

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

// Mismos iconos que ya usa FALLBACK_QUICKLINKS en HomePage.jsx para estas
// familias (ahi son un nombre-de-icono de texto para AccessIcon, aca son el
// componente ya importado -- FAMILIES es un set fijo de 6-7 ids, no hace
// falta el import dinamico que si necesita AccessIcon para iconos elegidos
// libremente desde el admin).
const FAMILY_ICONS = {
  plafones: Lightbulb,
  'luminaria-publica': MapPin,
  'cintas-led': Cable,
  'paneles-led': LayoutGrid,
  focos: Flashlight,
  tubos: Zap,
  proyectores: Video,
  'campanas-led': Bell,
  'equipos-emergencia': ShieldAlert,
  colgantes: Lamp,
  otros: Boxes
  // El resto de las familias nuevas (ver FAMILY_RULES en lib/api.js) cae al
  // fallback Boxes de abajo - no todas necesitan un icono propio distinto.
};

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

export function Header({ route, onNavigate, productos = [] }) {
  const [menuItems, setMenuItems] = useState(null); // null = todavia no respondio
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeFamilyId, setActiveFamilyId] = useState('');
  const megaMenuRef = useRef(null);

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

  // Se cierra solo al cambiar de ruta (no basta con cerrarlo en el onClick
  // del link: tambien debe cerrarse si el usuario navega con atras/adelante
  // del navegador, o si el link clickeado es externo -abre pestaña nueva,
  // nunca dispara onNavigate-).
  useEffect(() => {
    setMobileNavOpen(false);
    setMegaMenuOpen(false);
  }, [route.pathname, route.search]);

  // Familias reales del catalogo Faretto + su desglose de modelos, calculado
  // a partir del feed de productos (mismo resolveFamily/resolveModelo que ya
  // usa el sidebar de /catalogo -- ver CategoryPage.jsx). Se filtran las que
  // no tengan ningun producto (no deberia pasar, pero el feed es externo).
  const families = useMemo(() => {
    const byId = new Map();
    productos.forEach((product) => {
      const family = resolveFamily(product.nombre);
      if (!byId.has(family.id)) byId.set(family.id, { id: family.id, label: family.label, modelos: new Set(), count: 0 });
      const entry = byId.get(family.id);
      entry.count += 1;
      const modelo = resolveModelo(product.nombre);
      if (modelo) entry.modelos.add(modelo);
    });
    return FAMILIES
      .map((family) => byId.get(family.id))
      .filter(Boolean)
      .map((entry) => ({ ...entry, modelos: [...entry.modelos].sort((a, b) => a.localeCompare(b, 'es')) }));
  }, [productos]);

  useEffect(() => {
    if (families.length > 0 && !activeFamilyId) setActiveFamilyId(families[0].id);
  }, [families, activeFamilyId]);

  // Cierra al clickear afuera del panel (el boton que lo abre queda excluido
  // via el ref -- clickearlo de nuevo pasa por su propio onClick, que ya
  // togglea el estado).
  useEffect(() => {
    if (!megaMenuOpen) return undefined;
    const onDocClick = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) setMegaMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMegaMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [megaMenuOpen]);

  const navLinks = menuItems && menuItems.length > 0 ? menuItems : FALLBACK_NAV_LINKS;
  const activeFamily = families.find((family) => family.id === activeFamilyId);

  const goToFamily = (familyId) => {
    setMegaMenuOpen(false);
    onNavigate(`/catalogo?familia=${familyId}`);
  };
  const goToModelo = (familyId, modelo) => {
    setMegaMenuOpen(false);
    onNavigate(`/catalogo?familia=${familyId}&modelo=${encodeURIComponent(modelo)}`);
  };

  return (
    <header className={`public-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="header-row">
        <a className="brand-logo" href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }}>
          <img className="brand-logo-white" src="/assets/logo-faretto-white.webp" alt="Faretto — Illuminazione e Design" />
          <img className="brand-logo-color" src="/assets/logo-faretto.webp" alt="" aria-hidden="true" />
        </a>
        {/* Antes vivia como fila propia (blanca) debajo del header - subido
            aca adentro para liberar esa segunda fila; el buscador que
            ocupaba este lugar se saco (ver mismo pedido). */}
        <nav className={`public-nav ${mobileNavOpen ? 'is-open' : ''}`}>
          {navLinks.map((link) => {
            if (link.href === '/categorias' && families.length > 0) {
              return (
                <div className="mega-menu-item" key={link.href} ref={megaMenuRef}>
                  <button
                    type="button"
                    className={`mega-menu-trigger ${megaMenuOpen ? 'active' : ''}`}
                    aria-expanded={megaMenuOpen}
                    onClick={() => setMegaMenuOpen((current) => !current)}
                  >
                    {link.label}
                    <ChevronDown size={13} className="mega-menu-chevron" />
                  </button>
                  <div className={`mega-menu-panel ${megaMenuOpen ? 'is-open' : ''}`}>
                    <div className="mega-menu-families">
                      {families.map((family) => {
                        const Icon = FAMILY_ICONS[family.id] || Boxes;
                        const isActive = family.id === activeFamilyId;
                        return (
                          <button
                            type="button"
                            key={family.id}
                            className={`mega-menu-family ${isActive ? 'active' : ''}`}
                            // Antes esto navegaba directo si la familia ya estaba
                            // activa (pensado como "hover previsualiza, click de
                            // nuevo confirma") -- se saco: tanto Playwright como
                            // mobile real (Safari/Chrome emulan un mouseenter
                            // antes del primer tap) disparaban el onMouseEnter
                            // de aca abajo justo antes del click, asi que
                            // isActive ya daba true en el click y navegaba de
                            // una, sin darle chance al usuario de ver los
                            // modelos. Ahora el click SIEMPRE solo selecciona/
                            // previsualiza -- "Ver todo" (mega-menu-detail-head)
                            // es el unico camino para navegar a la familia
                            // completa, sin ambiguedad para mouse ni para touch.
                            onMouseEnter={() => setActiveFamilyId(family.id)}
                            onFocus={() => setActiveFamilyId(family.id)}
                            onClick={() => setActiveFamilyId(family.id)}
                          >
                            <Icon size={17} />
                            <span>{family.label}</span>
                            <ChevronRight size={15} className="mega-menu-family-chevron" />
                          </button>
                        );
                      })}
                    </div>
                    {activeFamily && (
                      <div className="mega-menu-detail">
                        <div className="mega-menu-detail-head">
                          <span>{activeFamily.label}</span>
                          <button type="button" className="mega-menu-viewall" onClick={() => goToFamily(activeFamily.id)}>
                            Ver todo <ArrowRight size={13} />
                          </button>
                        </div>
                        {activeFamily.modelos.length > 0 ? (
                          <div className="mega-menu-modelos">
                            {activeFamily.modelos.map((modelo) => (
                              <button type="button" key={modelo} onClick={() => goToModelo(activeFamily.id, modelo)}>
                                {modelo}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="mega-menu-empty">Sin modelos individuales — revisa todo el catálogo de esta familia.</p>
                        )}
                      </div>
                    )}
                    <a
                      className="mega-menu-footer"
                      href="/catalogo"
                      onClick={(event) => { event.preventDefault(); setMegaMenuOpen(false); onNavigate('/catalogo'); }}
                    >
                      Ver catálogo completo <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              );
            }

            return (
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
            );
          })}
        </nav>
        <div className="header-icons">
          {/* Sin cuenta ni carrito propios: este sitio es catalogo, no
              ecommerce. El unico "CTA de conversion" es cotizar por WhatsApp. */}
          <a className="icon-btn" href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="Cotizar por WhatsApp">
            <MessageCircle size={18} />
          </a>
          <button
            type="button"
            className="icon-btn nav-burger"
            aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((current) => !current)}
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
