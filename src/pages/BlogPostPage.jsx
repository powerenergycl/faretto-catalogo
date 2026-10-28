import { useEffect, useState } from 'react';
import { fetchFarettoBlogPost } from '../lib/api.js';
import { formatBlogDate } from './BlogPage.jsx';
import { useInitialData } from '../lib/initialData.js';
import { usePageTitle, pageTitle } from '../lib/seo.js';
import { NotFoundPage } from './NotFoundPage.jsx';

export function BlogPostPage({ slug, onNavigate }) {
  // undefined = todavia cargando, null = no existe (o no es de Faretto)
  const initialPost = useInitialData('blogPost');
  // Lo que el servidor ya resolvio para este slug (null = no existe).
  const fromServer = initialPost?.slug === slug ? (initialPost.notFound ? null : initialPost) : undefined;
  const [post, setPost] = useState(fromServer);

  useEffect(() => {
    if (fromServer !== undefined) return undefined;
    let cancelled = false;
    setPost(undefined);
    fetchFarettoBlogPost(slug)
      .then((data) => { if (!cancelled) setPost(data); })
      .catch(() => { if (!cancelled) setPost(null); });
    return () => { cancelled = true; };
  }, [slug]);

  // El <title> inicial lo pone el servidor; esto lo mantiene al navegar.
  usePageTitle(post?.titulo ? (post.seo_title || pageTitle({ name: 'blogPost', titulo: post.titulo })) : null);

  if (post === undefined) {
    return <div className="state-box">Cargando artículo…</div>;
  }

  if (!post) return <NotFoundPage onNavigate={onNavigate} />;

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
