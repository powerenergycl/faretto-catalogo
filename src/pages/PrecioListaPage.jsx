import { Lightbulb, MapPin, Cable, LayoutGrid, Flashlight, Zap, Boxes, Video, Bell, ShieldAlert, Lamp, ImageOff } from 'lucide-react';
import { FAMILIES, resolveFamily, formatPrice } from '../lib/api.js';

// Mismos iconos que ya usa Header.jsx para el megamenu de familias - una
// lista de precios es, en el fondo, el mismo agrupamiento por familia que el
// resto del sitio, solo que en formato tabla en vez de tarjetas.
const FAMILY_ICONS = {
  plafones: Lightbulb,
  'luminaria-publica': MapPin,
  'cintas-led': Cable,
  'paneles-led': LayoutGrid,
  focos: Flashlight,
  tubos: Zap,
  proyectores: Video,
  'campanas-led': Bell,
  'equipos-emergencia': ShieldAlert,
  colgantes: Lamp,
  otros: Boxes
};

// A diferencia del catalogo (que agrupa variantes de potencia/temperatura en
// una sola ficha, ver buildProductGroups), aca cada SKU es su propia fila -
// una lista de precios se consulta por SKU puntual, no por "producto
// principal".
export function PrecioListaPage({ productos }) {
  const grupos = FAMILIES
    .map((familia) => ({
      familia,
      items: productos.filter((producto) => resolveFamily(producto.nombre).id === familia.id)
    }))
    .filter((grupo) => grupo.items.length > 0);

  return (
    <>
      <div className="breadcrumb">Inicio <b>/</b> Lista de precios</div>
      <h1 className="cat-title">Lista de precios</h1>

      <div className="intro-box">
        <div><strong>Precio de lista Faretto</strong> — todos los productos publicados en el catálogo, agrupados por familia.</div>
        <div>Valores en pesos chilenos, más IVA. Sujetos a cambio sin previo aviso — para una cotización formal escríbenos por WhatsApp.</div>
      </div>

      {grupos.length === 0 ? (
        <div className="state-box">No hay productos publicados por el momento.</div>
      ) : (
        <>
          <div className="jump-nav">
            {grupos.map(({ familia, items }) => {
              const Icon = FAMILY_ICONS[familia.id] || Boxes;
              return (
                <a key={familia.id} className="jump-pill" href={`#familia-${familia.id}`}>
                  <Icon size={14} />
                  {familia.label}
                  <span>{items.length}</span>
                </a>
              );
            })}
          </div>

          {grupos.map(({ familia, items }) => {
            const Icon = FAMILY_ICONS[familia.id] || Boxes;
            return (
              <section className="price-family" id={`familia-${familia.id}`} key={familia.id}>
                <div className="price-family-head">
                  <span className="price-family-icon"><Icon size={18} /></span>
                  <h2>{familia.label}</h2>
                  <span>{items.length} producto{items.length === 1 ? '' : 's'}</span>
                </div>
                <div className="price-table">
                  <div className="price-table-head">
                    <span>Foto</span>
                    <span>SKU</span>
                    <span>Producto</span>
                    <span>Precio normal</span>
                  </div>
                  <div className="price-table-body">
                    {items.map((producto) => (
                      <div className="price-row" key={producto.id}>
                        <span className="price-cell-foto">
                          {producto.imagen ? <img src={producto.imagen} alt="" /> : <ImageOff size={18} />}
                        </span>
                        <span className="price-cell-sku">{producto.sku || '—'}</span>
                        <span className="price-cell-nombre">{producto.nombre}</span>
                        <span className="price-cell-precio">
                          {producto.precioNormal ? formatPrice(producto.precioNormal) : 'Consultar'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
