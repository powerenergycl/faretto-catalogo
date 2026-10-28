import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.jsx';
import { applyFarettoNombres } from './lib/catalog.js';

// Entrada del build SSR (`vite build --ssr`, ver package.json): server.js
// renderiza con esto los mismos componentes que ve el navegador, asi
// buscadores y asistentes de IA reciben el contenido real en el HTML.
export function render(url, initialData = {}) {
  if (initialData.nombres) applyFarettoNombres(initialData.nombres);
  return renderToString(
    <StrictMode>
      <App initialUrl={url} initialData={initialData} />
    </StrictMode>
  );
}

export * from './lib/catalog.js';
export * from './lib/routes.js';
export { pageTitle, modeloHeading } from './lib/seo.js';
