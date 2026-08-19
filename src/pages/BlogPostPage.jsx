import { useEffect, useState } from 'react';
import { fetchFarettoBlogPost } from '../lib/api.js';
import { formatBlogDate } from './BlogPage.jsx';

export function BlogPostPage({ slug, onNavigate }) {
  // undefined = todavia cargando, null = no existe (o no es de Faretto)
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    setPost(undefined);
    fetchFarettoBlogPost(slug)
      .then((data) => { if (!cancelled) setPost(data); })
      .catch(() => { if (!cancelled) setPost(null); });
    return () => { cancelled = true; };
  }, [slug]);

  // Sin SSR en este proyecto (server.js solo sirve el build estatico), asi
  // que esto es lo unico que ajusta el titulo de la pestaña/reader mode -
  // no reemplaza <head> real para crawlers, pero es gratis tenerlo.
  useEffect(() => {
    if (post?.titulo) document.title = `${post.titulo} — Faretto`;
    return () => { document.title = 'Faretto — Catálogo'; };
  }, [post]);

  if (post === undefined) {
    return <div className="state-box">Cargando artículo…</div>;
  }

  if (!post) {
    return (
      <div className="state-box">
        No encontramos este artículo.{' '}
        <a href="/blog" onClick={(event) => { event.preventDefault(); onNavigate('/blog'); }}>
          Volver al blog
        </a>
      </div>
    );
  }

  return (
    <article className="blog-post">
      <div className="breadcrumb">
        Inicio <b>/</b>{' '}
        <a href="/blog" onClick={(event) => { event.preventDefault(); onNavigate('/blog'); }}>Blog</a>{' '}
        <b>/</b> {post.titulo}
      </div>
      <h1 className="cat-title">{post.titulo}</h1>
      <div className="blog-post-meta">
        {formatBlogDate(post.fecha_publicacion)}
        {post.autor?.nombre && <> · {post.autor.nombre}</>}
      </div>
      {post.imagen_url && (
        <div className="blog-post-image">
          <img src={post.imagen_url} alt={post.imagen_alt || post.titulo} loading="eager" />
        </div>
      )}
      <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: post.contenido_html || '' }} />
    </article>
  );
}
