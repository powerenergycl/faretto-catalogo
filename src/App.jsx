import { useEffect, useState } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { CategoryPage } from './pages/CategoryPage.jsx';
import { BlogPage } from './pages/BlogPage.jsx';
import { BlogPostPage } from './pages/BlogPostPage.jsx';
import { DistribuidoresPage } from './pages/DistribuidoresPage.jsx';
import { PaginaPage } from './pages/PaginaPage.jsx';
import { ContactoPage } from './pages/ContactoPage.jsx';
import { PrecioListaPage } from './pages/PrecioListaPage.jsx';
import { ChatSearchWidget } from './components/ChatSearchWidget.jsx';
import { fetchFarettoProductos, fetchFarettoGaleria } from './lib/api.js';

function parseRoute() {
  return { pathname: window.location.pathname, search: window.location.search };
}

export function App() {
  const [route, setRoute] = useState(parseRoute);
  const [productos, setProductos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [galeriaGrupos, setGaleriaGrupos] = useState([]);

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchFarettoProductos()
      .then((data) => { if (!cancelled) { setProductos(data); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Nunca debe tumbar el catalogo: fetchFarettoGaleria ya devuelve []
    // sola si la carga falla.
    fetchFarettoGaleria().then((data) => { if (!cancelled) setGaleriaGrupos(data); });
    return () => { cancelled = true; };
  }, []);

  function navigate(path) {
    if (`${route.pathname}${route.search}` === path) return;
    window.history.pushState({}, '', path);
    setRoute(parseRoute());
    window.scrollTo(0, 0);
  }

  const isCatalogo = route.pathname === '/catalogo';
  const isBlog = route.pathname === '/blog';
  const blogSlugMatch = route.pathname.match(/^\/blog\/([^/]+)\/?$/);
  const blogSlug = blogSlugMatch ? decodeURIComponent(blogSlugMatch[1]) : null;
  const isDistribuidores = route.pathname === '/distribuidores';
  // "/quienes-somos" es un alias directo del slug 'quienes-somos' en la
  // misma tabla de paginas -- asi calza con el boton ya existente en
  // Accesos Destacados (url_destino: "quienes-somos") sin tener que
  // reconfigurar ese boton. Cualquier otra pagina nueva creada en el admin
  // vive en /pagina/<slug>.
  const isQuienesSomos = route.pathname === '/quienes-somos';
  const paginaSlugMatch = route.pathname.match(/^\/pagina\/([^/]+)\/?$/);
  const paginaSlug = isQuienesSomos ? 'quienes-somos' : (paginaSlugMatch ? decodeURIComponent(paginaSlugMatch[1]) : null);
  const isContacto = route.pathname === '/contacto';
  const isPrecioLista = route.pathname === '/precio-lista';
  const isHome = !isCatalogo && !isBlog && !blogSlug && !isDistribuidores && !paginaSlug && !isContacto && !isPrecioLista;

  return (
    <div>
      <Header route={route} onNavigate={navigate} productos={productos} />
      {/* Fuera de .public-main a proposito: el hero debe ocupar el ancho
          completo de la pantalla, sin heredar su max-width/padding. */}
      {isHome && <HeroSection onNavigate={navigate} />}
      <main className="public-main">
        {isCatalogo ? (
          <>
            {status === 'loading' && <div className="state-box">Cargando catálogo…</div>}
            {status === 'error' && <div className="state-box">No se pudo cargar el catálogo. Intenta de nuevo más tarde.</div>}
            {status === 'ready' && <CategoryPage productos={productos} galeriaGrupos={galeriaGrupos} route={route} onNavigate={navigate} />}
          </>
        ) : isBlog ? (
          <BlogPage onNavigate={navigate} />
        ) : blogSlug ? (
          <BlogPostPage slug={blogSlug} onNavigate={navigate} />
        ) : isDistribuidores ? (
          <DistribuidoresPage />
        ) : paginaSlug ? (
          <PaginaPage slug={paginaSlug} onNavigate={navigate} />
        ) : isContacto ? (
          <ContactoPage />
        ) : isPrecioLista ? (
          <>
            {status === 'loading' && <div className="state-box">Cargando lista de precios…</div>}
            {status === 'error' && <div className="state-box">No se pudo cargar la lista de precios. Intenta de nuevo más tarde.</div>}
            {status === 'ready' && <PrecioListaPage productos={productos} />}
          </>
        ) : (
          // El home no depende del feed de productos para pintar sus
          // secciones (accesos destacados, banners, blog) - solo la franja
          // de familias usa "productos" y ya maneja el caso de lista vacia.
          <HomePage productos={productos} dataStatus={status} onNavigate={navigate} />
        )}
      </main>
      <Footer />
      <ChatSearchWidget productos={productos} onNavigate={navigate} />
    </div>
  );
}
