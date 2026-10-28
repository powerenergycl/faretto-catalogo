import { useEffect, useState } from 'react';
import { fetchFarettoPagina } from '../lib/api.js';
import { useInitialData } from '../lib/initialData.js';
import { usePageTitle, pageTitle } from '../lib/seo.js';
import { NotFoundPage } from './NotFoundPage.jsx';

// Pagina de contenido generica (ej. /quienes-somos): administrable desde
// Power Admin > sitio Faretto > grupo Faretto > Páginas. Cualquier pagina
// nueva que se cree ahi queda disponible en /pagina/<slug> sin tocar codigo
// -- ver App.jsx para el ruteo de /quienes-somos especificamente.
export function PaginaPage({ slug, onNavigate }) {
  // undefined = todavia cargando, null = no existe (o no esta publicada)
  const initialPagina = useInitialData('pagina');
  // Lo que el servidor ya resolvio para este slug (null = no existe).
  const fromServer = initialPagina?.slug === slug ? (initialPagina.notFound ? null : initialPagina) : undefined;
  const [pagina, setPagina] = useState(fromServer);

  useEffect(() => {
    if (fromServer !== undefined) return undefined;
    let cancelled = false;
    setPagina(undefined);
    fetchFarettoPagina(slug)
      .then((data) => { if (!cancelled) setPagina(data); })
      .catch(() => { if (!cancelled) setPagina(null); });
    return () => { cancelled = true; };
  }, [slug]);

  usePageTitle(pagina?.titulo ? (pagina.seo_title || pageTitle({ name: 'pagina', titulo: pagina.titulo })) : null);

  if (pagina === undefined) {
    return <div className="state-box">Cargando página…</div>;
  }

  if (!pagina) return <NotFoundPage onNavigate={onNavigate} />;

  return (
    <article className="static-page">
      <div className="breadcrumb">Inicio <b>/</b> {pagina.titulo}</div>
      <div className="static-page-card">
        {pagina.imagen_url && (
          <div className="static-page-image">
            <img src={pagina.imagen_url} alt={pagina.imagen_alt || pagina.titulo} loading="eager" />
          </div>
        )}
        <h1 className="cat-title">{pagina.titulo}</h1>
        {pagina.resumen && <p className="static-page-resumen">{pagina.resumen}</p>}
        <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: pagina.contenido_html || '' }} />
      </div>
    </article>
  );
}
