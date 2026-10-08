import { useEffect, useState } from 'react';
import { ExternalLink, ImageOff } from 'lucide-react';
import { fetchConvenioMarco, formatPrice } from '../lib/api.js';

// Mismo listado que ya sirve powerenergy.cl/convenio-marco (administrable
// desde Power Admin > sitio_power) - ver fetchConvenioMarco en lib/api.js.
// Sin panel propio aca: es una copia de solo lectura sobre el mismo dato.
export function ConvenioMarcoPage() {
  const [items, setItems] = useState(null); // null = todavia no respondio
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchConvenioMarco()
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((err) => { if (!cancelled) { setItems([]); setError(err.message); } });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="breadcrumb">Inicio <b>/</b> Convenio Marco</div>
      <h1 className="cat-title">Catálogo Convenio Marco</h1>
      <p className="cat-description">
        Productos disponibles a través de Convenio Marco en Mercado Público. Haz clic en cualquier producto para verlo en el portal oficial.
      </p>

      {items === null ? (
        <div className="state-box">Cargando catálogo…</div>
      ) : error ? (
        <div className="state-box">{error}</div>
      ) : items.length === 0 ? (
        <div className="state-box">Aún no hay productos publicados en Convenio Marco.</div>
      ) : (
        <div className="convenio-marco-grid">
          {items.map((item, index) => (
            <article className="convenio-marco-card" key={`${item.codigo_cm || item.sku_convenio}-${index}`}>
              <a className="convenio-marco-card-image" href={item.link} target="_blank" rel="noopener noreferrer">
                {item.producto?.imagen_url
                  ? <img src={item.producto.imagen_url} alt={item.producto.nombre || item.articulo} loading="lazy" />
                  : <ImageOff size={28} />}
              </a>
              <div className="convenio-marco-card-body">
                <a className="convenio-marco-card-title" href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.producto?.nombre || item.articulo}
                </a>
                <div className="convenio-marco-card-codes">
                  <span>SKU {item.producto?.sku || item.sku_convenio}</span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Código CM {item.codigo_cm} <ExternalLink size={12} />
                  </a>
                </div>
                {item.precio_referencia > 0 && (
                  <div className="convenio-marco-card-price">{formatPrice(item.precio_referencia)} <small>referencial</small></div>
                )}
                {(item.producto?.atributos || []).length > 0 && (
                  <div className="convenio-marco-card-attrs">
                    {item.producto.atributos.map((attribute) => (
                      <span key={attribute.nombre}><strong>{attribute.nombre}:</strong> {attribute.valor}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
