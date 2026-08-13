import { ImageOff, Download } from 'lucide-react';
import { iconForSpec } from '../lib/specIcons.js';

// Estilo "hoja de ficha tecnica" (ver faretto.cl): 1 bloque ancho por SKU,
// apilados como indice - no grilla de cards chicas. Sin precio ni Cotizar,
// solo specs + link a la ficha (decision explicita, replica el original).
export function ProductCard({ product }) {
  const specs = product.specs || [];

  return (
    <article className="product-sheet">
      <div className="product-sheet-header">
        <div className="product-sheet-media">
          {product.imagen ? (
            <img src={product.imagen} alt={product.nombre} loading="lazy" width={200} height={200} />
          ) : <ImageOff size={28} />}
        </div>
        <div className="product-sheet-heading">
          <span className="product-sheet-sku">SKU {product.sku || 'pendiente'}</span>
          <h2 className="product-sheet-name">{product.nombre}</h2>
          {product.fichaTecnicaUrl && (
            <a className="product-sheet-pdf" href={product.fichaTecnicaUrl} target="_blank" rel="noreferrer">
              <Download size={14} /> Ficha técnica
            </a>
          )}
        </div>
      </div>

      {specs.length > 0 && (
        <div className="product-sheet-specs">
          {specs.map((spec) => {
            const Icon = iconForSpec(spec.label);
            return (
              <div className="product-sheet-spec" key={spec.label}>
                <span className="icon-circle"><Icon size={16} /></span>
                <span>{spec.label}</span>
                <strong>{spec.valor}</strong>
              </div>
            );
          })}
        </div>
      )}

      <div className="product-sheet-footer">
        <a href={`https://powerenergy.cl/producto/${product.slug}`} target="_blank" rel="noreferrer">Ver Ficha</a>
      </div>
    </article>
  );
}
