import { Search, MessageCircle } from 'lucide-react';

// Solo 2 rutas reales por ahora (Home y Catalogo, por eso el pedido
// original) - los demas links de familia navegan a /catalogo con el filtro
// ya aplicado, no a paginas propias.
const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo completo' },
  { href: '/catalogo?familia=plafones', label: 'Plafones' },
  { href: '/catalogo?familia=luminaria-publica', label: 'Luminaria pública' },
  { href: '/catalogo?familia=paneles-led', label: 'Paneles LED' }
];

export function Header({ route, onNavigate }) {
  return (
    <header className="public-header">
      <div className="header-row">
        <a className="brand-logo" href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }}>
          <img src="/assets/logo-faretto.webp" alt="Faretto — Illuminazione e Design" />
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
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`${route.pathname}${route.search}` === link.href || (route.pathname === link.href && !route.search) ? 'active' : ''}
            onClick={(event) => { event.preventDefault(); onNavigate(link.href); }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
