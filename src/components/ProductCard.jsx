import { ImageOff, Download } from 'lucide-react';
import { iconForSpec } from '../lib/specIcons.js';
import { cleanSpecValue } from '../lib/api.js';

// Ficha "por modelo" (ver catalogo impreso de Faretto): 1 foto + 1 titulo
// generico representan a todos los SKU que son la misma pieza en distintas
// potencias/temperaturas de color (agrupados en lib/api.js#buildProductGroups).
// Orden: titulo arriba, galeria de fotos (la #1 es la foto principal, ver
// mas abajo), iconos de specs compartidos, tabla de variantes suelta a todo
// el ancho al final.
function isMaskedValue(valor = '') {
  return /^\*+$/.test(String(valor || '').trim());
}

// La foto grande de encabezado esta oculta a proposito (2026-08-25): la foto
// #1 de la galeria ya se ve en el primer casillero de la grilla (ver mas
// abajo), mostrarla tambien arriba duplicaba la misma imagen. No se borro el
// bloque - solo hay que volver este flag a true si mas adelante se necesita
// de nuevo el encabezado con foto.
const SHOW_HEADER_PHOTO = false;

export function ProductCard({ ficha, showLumexBadge = false }) {
  const sharedSpecs = (ficha.sharedSpecs || []).filter((spec) => !isMaskedValue(spec.valor));
  const columns = ficha.columns || [];
  const rows = ficha.rows || [];
  // Cada Potencia trae su propio PDF (ej. 12W y 18W del mismo modelo tienen
  // fichas distintas) - el boton va por fila, no una vez arriba de toda la
  // tarjeta.
  const hasFichaTecnica = rows.some((row) => row.fichaTecnicaUrl);

  return (
    <article className="product-sheet">
      {/* Distintivo de linea Lumex (ver /catalogo?marca=lumex en
          CategoryPage.jsx) - el circulo-X recortado del logo real, no el
          wordmark completo (ilegible a este tamaño). */}
      {showLumexBadge && (
        <img className="product-sheet-lumex-badge" src="/assets/logo-lumex-icon.webp" alt="Línea Lumex" title="Línea Lumex" />
      )}
      <div className={`product-sheet-header ${SHOW_HEADER_PHOTO ? '' : 'product-sheet-header-no-media'}`}>
        {SHOW_HEADER_PHOTO && (
          <div className="product-sheet-media">
            {ficha.imagen ? (
              <img src={ficha.imagen} alt={ficha.titulo} loading="lazy" width={200} height={200} />
            ) : <ImageOff size={28} />}
          </div>
        )}
        <div className="product-sheet-heading">
          <h2 className="product-sheet-name">{ficha.titulo}</h2>
        </div>
      </div>

      {/* Galeria de fotos del producto (instalacion, detalle, empaque, etc.) -
          administrable desde Power Admin > Faretto > Galeria de producto.
          El primer casillero es la misma foto que ficha.imagen de arriba
          (ver buildFichaFromGroup en lib/api.js) - no se salta, "queda por
          defecto" ahi. Se completa hasta 6 casilleros con placeholders para
          que la grilla no salte de tamaño mientras se van cargando fotos de
          a poco. */}
      <div className="product-sheet-gallery">
        {Array.from({ length: 6 }).map((_, i) => {
          const url = (ficha.galeria || [])[i];
          return (
            <div className="product-sheet-gallery-tile" key={i}>
              {url ? (
                <a href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`${ficha.titulo} - foto ${i + 1}`} loading="lazy" />
                </a>
              ) : <ImageOff size={18} />}
            </div>
          );
        })}
      </div>

      {sharedSpecs.length > 0 && (
        <div className="product-sheet-specs">
          {sharedSpecs.map((spec) => {
            const Icon = iconForSpec(spec.label);
            return (
              <div className="product-sheet-spec" key={spec.label}>
                <span className="icon-circle"><Icon size={16} /></span>
                <span>{spec.label}</span>
                <strong>{cleanSpecValue(spec.label, spec.valor)}</strong>
              </div>
            );
          })}
        </div>
      )}

      {rows.length > 0 && (
        <div className="product-sheet-table-wrap">
          <table className="product-sheet-table">
            <thead>
              <tr>
                <th>SKU</th>
                {columns.map((label) => <th key={label}>{label}</th>)}
                {ficha.hasTemperatura && <th>Temperatura</th>}
                {hasFichaTecnica && <th>Ficha Técnica</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.skus.join('-')}>
                  <td>{row.skus.map((sku) => <div key={sku}>{sku}</div>)}</td>
                  {columns.map((label) => (
                    <td className="product-sheet-table-value" key={label}>{cleanSpecValue(label, row.values[label])}</td>
                  ))}
                  {ficha.hasTemperatura && (
                    <td>
                      {row.temperaturas.map((temperatura, i) => {
                        const colorLuz = row.coloresLuz?.[i];
                        return (
                          <div className="product-sheet-temp-line" key={i}>
                            {temperatura}
                            {colorLuz && (
                              <span className={`product-sheet-luz-dot luz-${colorLuz}`} title={`Luz ${colorLuz}`} aria-hidden="true" />
                            )}
                          </div>
                        );
                      })}
                    </td>
                  )}
                  {hasFichaTecnica && (
                    <td className="product-sheet-table-value">
                      {row.fichaTecnicaUrl && (
                        <a className="product-sheet-pdf" href={row.fichaTecnicaUrl} target="_blank" rel="noreferrer">
                          <Download size={14} /> Ficha técnica
                        </a>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
