import { usePageTitle, pageTitle } from '../lib/seo.js';

// El servidor ya responde 404 para estas rutas (ver server.js); esto es lo
// que ve la persona, con salidas hacia lo principal del sitio.
export function NotFoundPage({ onNavigate }) {
  usePageTitle(pageTitle({ name: 'notFound' }));
  const go = (path) => (event) => { event.preventDefault(); onNavigate(path); };

  return (
    <div className="state-box">
      <h1 className="cat-title">Página no encontrada</h1>
      <p>
        La dirección que buscas no existe o cambió. Revisa el{' '}
        <a href="/catalogo" onClick={go('/catalogo')}>catálogo completo</a>, el{' '}
        <a href="/blog" onClick={go('/blog')}>blog</a> o{' '}
        <a href="/" onClick={go('/')}>vuelve al inicio</a>.
      </p>
    </div>
  );
}
