import { useEffect } from 'react';

const normalize = (text = '') => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Nombre del modelo para titulo/h1. Varios modelos vienen renombrados desde
// Power Admin con el tipo de producto incluido ("Plafón Corvus", "Estanco
// Alkaid"): ahi no se antepone la familia para no repetirla.
export function modeloHeading(familia = '', modelo = '') {
  const firstWord = normalize(modelo).split(/\s+/)[0] || '';
  const yaDiceElTipo = firstWord.length >= 4 && normalize(familia).includes(firstWord.slice(0, 5));
  return yaDiceElTipo ? `${modelo} Faretto` : `${familia} Faretto ${modelo}`;
}

// Titulos por pagina: los usa el servidor para el <title> inicial (ver
// server/seo.js) y cada pagina para actualizarlo al navegar dentro del sitio.
export function pageTitle({ name, familia, modelo, titulo } = {}) {
  switch (name) {
    case 'home': return 'Faretto Chile — Iluminación LED técnica | Power Energy';
    case 'catalogo': return 'Catálogo Faretto — Iluminación LED con ficha técnica | Power Energy';
    case 'familia': return `${familia} Faretto — Catálogo y fichas técnicas`;
    case 'modelo': return `${modeloHeading(familia, modelo)} — Ficha técnica y variantes`;
    case 'lumex': return 'Línea Lumex — Iluminación industrial Faretto';
    case 'blog': return 'Blog Faretto — Iluminación LED, normativa y proyectos';
    case 'blogPost':
    case 'pagina': return `${titulo} — Faretto`;
    case 'distribuidores': return 'Distribuidores autorizados Faretto en Chile';
    case 'contacto': return 'Contacto — Faretto Chile';
    case 'precioLista': return 'Lista de precios Faretto';
    case 'notFound': return 'Página no encontrada — Faretto';
    default: return 'Faretto — Catálogo';
  }
}

export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
