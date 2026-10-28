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
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { ChatSearchWidget } from './components/ChatSearchWidget.jsx';
import { fetchFarettoProductos, fetchFarettoGaleria } from './lib/api.js';
import { parseRoute, legacyCatalogPath } from './lib/routes.js';
import { InitialDataContext } from './lib/initialData.js';

function splitUrl(url) {
  const { pathname, search } = new URL(url, 'http://localhost');
  return { pathname, search };
}

function currentUrl() {
  return { pathname: window.location.pathname, search: window.location.search };
}

// initialUrl/initialData: los pasa el servidor al renderizar (ver
// entry-server.jsx) y el navegador en el primer render (main.jsx).
export function App({ initialUrl, initialData = {} }) {
  const [url, setUrl] = useState(() => (initialUrl ? splitUrl(initialUrl) : currentUrl()));
  const [productos, setProductos] = useState(initialData.productos || []);
  const [status, setStatus] = useState(initialData.productos ? 'ready' : 'loading');
  const [galeriaGrupos, setGaleriaGrupos] = useState(initialData.galeria || []);

  useEffect(() => {
    const onPopState = () => setUrl(currentUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (initialData.productos) return undefined;
    let cancelled = false;
    fetchFarettoProductos()
      .then((data) => { if (!cancelled) { setProductos(data); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (initialData.galeria) return undefined;
    let cancelled = false;
    // Nunca debe tumbar el catalogo: fetchFarettoGaleria ya devuelve []
    // sola si la carga falla.
    fetchFarettoGaleria().then((data) => { if (!cancelled) setGaleriaGrupos(data); });
    return () => { cancelled = true; };
  }, []);

  function navigate(path) {
    const next = splitUrl(path);
    // Links viejos con ?familia=/?modelo= (ej. menu cargado en Power Admin)
    // se llevan a la ruta limpia equivalente, igual que el 301 del servidor.
    const legacy = legacyCatalogPath(next.pathname, next.search, productos);
    const target = legacy || `${next.pathname}${next.search}`;
    if (`${url.pathname}${url.search}` === target) return;
    window.history.pushState({}, '', target);
    setUrl(currentUrl());
    window.scrollTo(0, 0);
  }

  const route = parseRoute(url.pathname);
  const catalogRoute = ['catalogo', 'familia', 'modelo', 'lumex'].includes(route.name);

  function renderPage() {
    if (catalogRoute || route.name === 'precioLista') {
      if (status === 'loading') return <div className="state-box">Cargando catálogo…</div>;
      if (status === 'error') return <div className="state-box">No se pudo cargar el catálogo. Intenta de nuevo más tarde.</div>;
      return route.name === 'precioLista'
        ? <PrecioListaPage productos={productos} />
        : <CategoryPage productos={productos} galeriaGrupos={galeriaGrupos} route={route} onNavigate={navigate} />;
    }
    switch (route.name) {
      case 'blog': return <BlogPage onNavigate={navigate} />;
      case 'blogPost': return <BlogPostPage slug={route.slug} onNavigate={navigate} />;
      case 'distribuidores': return <DistribuidoresPage />;
      case 'pagina': return <PaginaPage slug={route.slug} onNavigate={navigate} />;
      case 'contacto': return <ContactoPage />;
      case 'notFound': return <NotFoundPage onNavigate={navigate} />;
      // El home no depende del feed de productos para pintar sus
      // secciones (accesos destacados, banners, blog) - solo la franja
      // de familias usa "productos" y ya maneja el caso de lista vacia.
      default: return <HomePage productos={productos} dataStatus={status} onNavigate={navigate} />;
    }
  }

  return (
    <InitialDataContext.Provider value={initialData}>
      <div>
        <Header route={url} onNavigate={navigate} productos={productos} />
        {/* Fuera de .public-main a proposito: el hero debe ocupar el ancho
            completo de la pantalla, sin heredar su max-width/padding. */}
        {route.name === 'home' && <HeroSection onNavigate={navigate} />}
        <main className="public-main">{renderPage()}</main>
        <Footer />
        <ChatSearchWidget productos={productos} onNavigate={navigate} />
      </div>
    </InitialDataContext.Provider>
  );
}
