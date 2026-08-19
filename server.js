import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Server minimo: solo sirve el build estatico (dist/) + un healthcheck. No
// hay API propia ni credenciales de Supabase aca - todos los datos vienen de
// sitio_power via /api/public/faretto-productos (ver src/lib/api.js).
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const port = process.env.PORT || 8080;

app.use(compression());

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, version: process.env.APP_VERSION || 'local' });
});

app.use(express.static(distPath, {
  index: false,
  maxAge: '1y',
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// SPA fallback: rutas reales (Home, /catalogo, /blog, /blog/:slug) resueltas
// del lado del cliente por App.jsx.
app.get('*', (_req, res) => {
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`Faretto catalogo escuchando en http://localhost:${port}`);
});
