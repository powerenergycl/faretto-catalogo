# Faretto — Catálogo

Microsite de catálogo (no ecommerce) para la línea Faretto. Proyecto separado
de `sitio_power`, con deploy propio, pero **sin base de datos propia**: todos
los productos vienen de `sitio_power` vía un endpoint público de solo
lectura, filtrado por marca (nombre/SKU con "Faretto").

## Cómo conecta con sitio_power

```
sitio_power (Supabase, tabla productos)
  → GET /api/public/faretto-productos   (backend/src/routes/publicCatalogRoutes.js)
  → este sitio hace fetch() a esa URL   (src/lib/api.js)
  → home + /catalogo pintan los productos
```

Si cambia un precio, stock o ficha en sitio_power, se refleja acá en el
siguiente `fetch` (no hay caché propia todavía más allá del `Cache-Control`
de 5 min que pone el endpoint).

## Estructura

- `src/App.jsx` — router mínimo sin dependencias (2 rutas: `/` y `/catalogo`).
- `src/pages/HomePage.jsx` — franja de familias + intro SEO.
- `src/pages/CategoryPage.jsx` — sidebar de filtro por familia + grilla de producto.
- `src/lib/api.js` — fetch al endpoint público + heurística de familia por nombre.
- `src/styles.css` — misma plantilla visual que powerenergy.cl (radios, sombras, layout), con `#016666` en vez de `#2a658f`.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # opcional, para apuntar al backend local de sitio_power
npm run dev                  # http://localhost:5174
```

## Deploy (Cloud Run, servicio propio — independiente de sitio_power)

```bash
gcloud builds submit --config cloudbuild.yaml
```

Después, para apuntarle un dominio propio:

```bash
gcloud beta run domain-mappings create --service faretto-catalogo --domain TU_DOMINIO --region us-central1
```

## Pendiente / decisiones abiertas

- Logo y color son los reales de Faretto (`#016666`, `logo-hfaretto.webp`); el resto de la plantilla se sigue afinando.
- Sin página de producto individual todavía — "Ver" enlaza al producto real en powerenergy.cl y "Cotizar" abre WhatsApp.
- Familia se infiere del nombre del producto (`src/lib/api.js`); si sitio_power llega a exponer una categoría/familia real en el feed público, reemplazar esa heurística.
