import { ImageOff, Download } from 'lucide-react';
import { iconForSpec } from '../lib/specIcons.js';
import { cleanSpecValue } from '../lib/api.js';

// Ficha "por modelo" (ver catalogo impreso de Faretto): 1 foto + 1 titulo
// generico representan a todos los SKU que son la misma pieza en distintas
// potencias/temperaturas de color (agrupados en lib/api.js#buildProductGroups).
// Los atributos que se repiten igual en todo el grupo van como iconos
// (arriba); los que cambian por SKU (potencia, medidas, lumenes...) van en
// la tabla, con SKU + Temperatura apilados por fila cuando corresponde.
function isMaskedValue(valor = '') {
  return /^\*+$/.test(String(valor || '').trim());
}

export function ProductCard({ ficha }) {
  const sharedSpecs = (ficha.sharedSpecs || []).filter((spec) => !isMaskedValue(spec.valor));
  const columns = ficha.columns || [];
  const rows = ficha.rows || [];

  return (
    <article className="product-sheet">
      <div className="product-sheet-title-row">
        <h2 className="product-sheet-name">{ficha.titulo}</h2>
        {ficha.fichaTecnicaUrl && (
          <a className="product-sheet-pdf" href={ficha.fichaTecnicaUrl} target="_blank" rel="noreferrer">
            <Download size={14} /> Ficha técnica
          </a>
        )}
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

      <div className="product-sheet-body">
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
                      <td>{row.temperaturas.map((temperatura, i) => <div key={i}>{temperatura}</div>)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="product-sheet-media">
          {ficha.imagen ? (
            <img src={ficha.imagen} alt={ficha.titulo} loading="lazy" width={360} height={360} />
          ) : <ImageOff size={28} />}
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

      <div className="product-sheet-footer" />
    </article>
  );
}
