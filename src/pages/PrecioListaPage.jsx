import { useState } from 'react';
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

  // Pestañas en vez de una sola lista larga: con ~335 SKU en 16 familias,
  // desplegarlas todas de una vez hacia una pagina interminable de scroll.
  // Solo se pinta la familia activa; el resto vive en memoria (sin refetch
  // al cambiar de pestaña). Arranca en la primera familia con productos.
  const [activeFamilyId, setActiveFamilyId] = useState(() => grupos[0]?.familia.id ?? null);
  const activeGrupo = grupos.find(({ familia }) => familia.id === activeFamilyId) || grupos[0];

  return (
    <>
      <div className="breadcrumb">Inicio <b>/</b> Lista de precios</div>
      <h1 className="cat-title">Lista de precios</h1>

      {grupos.length === 0 ? (
        <div className="state-box">No hay productos publicados por el momento.</div>
      ) : (
        <>
          <div className="jump-nav" role="tablist">
            {grupos.map(({ familia, items }) => {
              const Icon = FAMILY_ICONS[familia.id] || Boxes;
              const isActive = familia.id === activeGrupo.familia.id;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  key={familia.id}
                  className={`jump-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveFamilyId(familia.id)}
                >
                  <Icon size={14} />
                  {familia.label}
                  <span>{items.length}</span>
                </button>
              );
            })}
          </div>

          <section className="price-family" key={activeGrupo.familia.id}>
            <div className="price-family-head">
              <span className="price-family-icon">
                {(() => { const Icon = FAMILY_ICONS[activeGrupo.familia.id] || Boxes; return <Icon size={18} />; })()}
              </span>
              <h2>{activeGrupo.familia.label}</h2>
              <span>{activeGrupo.items.length} producto{activeGrupo.items.length === 1 ? '' : 's'}</span>
            </div>
            <div className="price-table">
              <div className="price-table-head">
                <span>Foto</span>
                <span>SKU</span>
                <span>Producto</span>
                <span>Precio normal</span>
              </div>
              <div className="price-table-body">
                {activeGrupo.items.map((producto) => (
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
        </>
      )}
    </>
  );
}
