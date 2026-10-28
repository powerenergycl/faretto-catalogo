import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { applyFarettoNombres } from './lib/api.js';
import './styles.css';

// El servidor ya entrega la pagina renderizada (ver server.js) junto con los
// datos que uso para armarla: se "hidrata" ese HTML en vez de reemplazarlo.
// Sin datos del servidor (ej. `npm run dev`) se renderiza desde cero.
const initialData = window.__FARETTO_DATA__;
const container = document.getElementById('root');

if (initialData) {
  if (initialData.nombres) applyFarettoNombres(initialData.nombres);
  hydrateRoot(container, (
    <StrictMode>
      <App initialData={initialData} />
    </StrictMode>
  ));
} else {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
