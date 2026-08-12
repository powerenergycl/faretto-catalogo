import { ImageOff } from 'lucide-react';
import { formatPrice } from '../lib/api.js';
import { iconForSpec } from '../lib/specIcons.js';

// Cuantas specs entran en la tarjeta de la grilla antes de que se vuelva
// demasiado alta - ya vienen ordenadas por relevancia desde el feed
// (potencia/electrico primero, medidas/garantia al final).
const SPECS_EN_GRILLA = 6;

export function ProductCard({ product }) {
  const quoteHref = `https://wa.me/?text=${encodeURIComponent(`Hola, quiero cotizar: ${product.nombre} (SKU ${product.sku})`)}`;
  const specs = (product.specs || []).slice(0, SPECS_EN_GRILLA);

  return (
    <article className="product-card">
      <div className="product-media">
        {product.imagen ? (
          <img src={product.imagen} alt={product.nombre} loading="lazy" width={200} height={200} />
        ) : <ImageOff size={28} />}
      </div>
      <div className="product-body">
        <span className="product-sku">SKU {product.sku || 'pendiente'}</span>
        <div className="product-name">{product.nombre}</div>

        {specs.length > 0 && (
          <div className="product-specs">
            {specs.map((spec) => {
              const Icon = iconForSpec(spec.label);
              return (
                <div className="product-spec" key={spec.label}>
                  <Icon size={14} />
                  <div>
                    <span>{spec.label}</span>
                    <strong>{spec.valor}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.precio)}</span>
          <span className="tax-badge">+ iva</span>
        </div>
        <div className="product-actions">
          <a className="primary" href={quoteHref} target="_blank" rel="noreferrer">Cotizar</a>
          <a className="secondary" href={`https://powerenergy.cl/producto/${product.slug}`} target="_blank" rel="noreferrer">Ver ficha</a>
        </div>
      </div>
    </article>
  );
}
