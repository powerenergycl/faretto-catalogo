import { useEffect, useState } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { CategoryPage } from './pages/CategoryPage.jsx';
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

  return (
    <div>
      <Header route={route} onNavigate={navigate} />
      <main className="public-main">
        {status === 'loading' && <div className="state-box">Cargando catálogo…</div>}
        {status === 'error' && <div className="state-box">No se pudo cargar el catálogo. Intenta de nuevo más tarde.</div>}
        {status === 'ready' && (
          route.pathname === '/catalogo'
            ? <CategoryPage productos={productos} route={route} onNavigate={navigate} />
            : <HomePage productos={productos} onNavigate={navigate} />
        )}
      </main>
      <Footer />
    </div>
  );
}
