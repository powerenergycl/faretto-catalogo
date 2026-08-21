import { useEffect, useState } from 'react';
import { fetchFarettoPagina } from '../lib/api.js';

// Pagina de contenido generica (ej. /quienes-somos): administrable desde
// Power Admin > sitio Faretto > grupo Faretto > Páginas. Cualquier pagina
// nueva que se cree ahi queda disponible en /pagina/<slug> sin tocar codigo
// -- ver App.jsx para el ruteo de /quienes-somos especificamente.
export function PaginaPage({ slug, onNavigate }) {
  // undefined = todavia cargando, null = no existe (o no esta publicada)
  const [pagina, setPagina] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    setPagina(undefined);
    fetchFarettoPagina(slug)
      .then((data) => { if (!cancelled) setPagina(data); })
      .catch(() => { if (!cancelled) setPagina(null); });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (pagina?.titulo) document.title = `${pagina.titulo} — Faretto`;
    return () => { document.title = 'Faretto — Catálogo'; };
  }, [pagina]);

  if (pagina === undefined) {
    return <div className="state-box">Cargando página…</div>;
  }

  if (!pagina) {
    return (
      <div className="state-box">
        No encontramos esta página.{' '}
        <a href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }}>
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <article className="static-page">
      <div className="breadcrumb">Inicio <b>/</b> {pagina.titulo}</div>
      <h1 className="cat-title">{pagina.titulo}</h1>
      {pagina.resumen && <p className="cat-description">{pagina.resumen}</p>}
      {pagina.imagen_url && (
        <div className="static-page-image">
          <img src={pagina.imagen_url} alt={pagina.imagen_alt || pagina.titulo} loading="eager" />
        </div>
      )}
      <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: pagina.contenido_html || '' }} />
    </article>
  );
}
