import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { fetchFarettoBlog } from '../lib/api.js';

export function formatBlogDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BlogPage({ onNavigate }) {
  // null = todavia no respondio el fetch
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchFarettoBlog()
      .then((data) => { if (!cancelled) setPosts(data); })
      .catch(() => { if (!cancelled) setPosts([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="breadcrumb">Inicio <b>/</b> Blog</div>
      <h1 className="cat-title">Del blog</h1>

      {posts === null ? (
        <div className="state-box">Cargando artículos…</div>
      ) : posts.length === 0 ? (
        <div className="state-box">Todavía no hay artículos publicados.</div>
      ) : (
        <div className="home-blog-grid">
          {posts.map((post) => (
            <a
              key={post.slug}
              className="home-blog-card"
              href={`/blog/${post.slug}`}
              onClick={(event) => { event.preventDefault(); onNavigate(`/blog/${post.slug}`); }}
            >
              <div className="home-blog-thumb">
                {post.imagen_url ? (
                  <img src={post.imagen_url} alt={post.imagen_alt || post.titulo} loading="lazy" />
                ) : (
                  <Newspaper size={22} />
                )}
              </div>
              <div className="home-blog-body">
                <span>{formatBlogDate(post.fecha_publicacion)}</span>
                <strong>{post.titulo}</strong>
                {post.resumen && <p>{post.resumen}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
