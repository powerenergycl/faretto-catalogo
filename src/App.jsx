import { useEffect, useState } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { CategoryPage } from './pages/CategoryPage.jsx';
import { BlogPage } from './pages/BlogPage.jsx';
import { BlogPostPage } from './pages/BlogPostPage.jsx';
import { DistribuidoresPage } from './pages/DistribuidoresPage.jsx';
import { fetchFarettoProductos } from './lib/api.js';

function parseRoute() {
  return { pathname: window.location.pathname, search: window.location.search };
}

export function App() {
  const [route, setRoute] = useState(parseRoute);
  const [productos, setProductos] = useState([]);
  const [status, setStatus] = useState('loading');

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
  const isHome = !isCatalogo && !isBlog && !blogSlug && !isDistribuidores;

  return (
    <div>
      <Header route={route} onNavigate={navigate} />
      {/* Fuera de .public-main a proposito: el hero debe ocupar el ancho
          completo de la pantalla, sin heredar su max-width/padding. */}
      {isHome && <HeroSection onNavigate={navigate} />}
      <main className="public-main">
        {isCatalogo ? (
          <>
            {status === 'loading' && <div className="state-box">Cargando catálogo…</div>}
            {status === 'error' && <div className="state-box">No se pudo cargar el catálogo. Intenta de nuevo más tarde.</div>}
            {status === 'ready' && <CategoryPage productos={productos} route={route} onNavigate={navigate} />}
          </>
        ) : isBlog ? (
          <BlogPage onNavigate={navigate} />
        ) : blogSlug ? (
          <BlogPostPage slug={blogSlug} onNavigate={navigate} />
        ) : isDistribuidores ? (
          <DistribuidoresPage />
        ) : (
          // El home no depende del feed de productos para pintar sus
          // secciones (accesos destacados, banners, blog) - solo la franja
          // de familias usa "productos" y ya maneja el caso de lista vacia.
          <HomePage productos={productos} dataStatus={status} onNavigate={navigate} />
        )}
      </main>
      <Footer />
    </div>
  );
}
