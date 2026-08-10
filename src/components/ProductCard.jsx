import { ImageOff } from 'lucide-react';
import { formatPrice } from '../lib/api.js';

export function ProductCard({ product }) {
  const quoteHref = `https://wa.me/?text=${encodeURIComponent(`Hola, quiero cotizar: ${product.nombre} (SKU ${product.sku})`)}`;

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
        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.precio)}</span>
          <span className="tax-badge">+ iva</span>
        </div>
        <div className="product-actions">
          <a className="primary" href={quoteHref} target="_blank" rel="noreferrer">Cotizar</a>
          <a className="secondary" href={`https://powerenergy.cl/producto/${product.slug}`} target="_blank" rel="noreferrer">Ver</a>
        </div>
      </div>
    </article>
  );
}
