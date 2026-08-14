import { ImageOff, Download } from 'lucide-react';
import { iconForSpec } from '../lib/specIcons.js';
import { cleanSpecValue } from '../lib/api.js';

// Ficha "por modelo" (ver catalogo impreso de Faretto): 1 foto + 1 titulo
// generico representan a todos los SKU que son la misma pieza en distintas
// potencias/temperaturas de color (agrupados en lib/api.js#buildProductGroups).
// Orden: foto+titulo arriba, galeria de fotos, iconos de specs compartidos,
// tabla de variantes suelta a todo el ancho al final.
function isMaskedValue(valor = '') {
  return /^\*+$/.test(String(valor || '').trim());
}

export function ProductCard({ ficha }) {
  const sharedSpecs = (ficha.sharedSpecs || []).filter((spec) => !isMaskedValue(spec.valor));
  const columns = ficha.columns || [];
  const rows = ficha.rows || [];

  return (
    <article className="product-sheet">
      <div className="product-sheet-header">
        <div className="product-sheet-media">
          {ficha.imagen ? (
            <img src={ficha.imagen} alt={ficha.titulo} loading="lazy" width={200} height={200} />
          ) : <ImageOff size={28} />}
        </div>
        <div className="product-sheet-heading">
          <h2 className="product-sheet-name">{ficha.titulo}</h2>
          {ficha.fichaTecnicaUrl && (
            <a className="product-sheet-pdf" href={ficha.fichaTecnicaUrl} target="_blank" rel="noreferrer">
              <Download size={14} /> Ficha técnica
            </a>
          )}
        </div>
      </div>

      {/* Galeria de fotos del producto (instalacion, detalle, empaque, etc.) -
          contenido pendiente de admin, por ahora placeholders 1:1. */}
      <div className="product-sheet-gallery">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="product-sheet-gallery-tile" key={i}>
            <ImageOff size={18} />
          </div>
        ))}
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
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.skus.join('-')}>
                  <td>{row.skus.map((sku) => <div key={sku}>{sku}</div>)}</td>
                  {columns.map((label) => (
                    <td key={label}>{cleanSpecValue(label, row.values[label])}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
