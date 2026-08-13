import { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard.jsx';
import { FAMILIES, resolveFamily } from '../lib/api.js';

const PAGE_SIZE = 24;

export function CategoryPage({ productos, route, onNavigate }) {
  const activeFamily = new URLSearchParams(route.search).get('familia') || '';
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const familyCounts = useMemo(() => {
    const counts = new Map();
    for (const product of productos) {
      const family = resolveFamily(product.nombre);
      counts.set(family.id, (counts.get(family.id) || 0) + 1);
    }
    return counts;
  }, [productos]);

  const filtered = useMemo(() => {
    if (!activeFamily) return productos;
    return productos.filter((product) => resolveFamily(product.nombre).id === activeFamily);
  }, [productos, activeFamily]);

  const visible = filtered.slice(0, visibleCount);
  const activeFamilyLabel = FAMILIES.find((family) => family.id === activeFamily)?.label;

  function selectFamily(familyId) {
    setVisibleCount(PAGE_SIZE);
    onNavigate(familyId ? `/catalogo?familia=${familyId}` : '/catalogo');
  }

  return (
    <>
      <div className="breadcrumb">Inicio <b>/</b> {activeFamilyLabel || 'Catálogo Faretto'}</div>
      <h1 className="cat-title">{activeFamilyLabel || 'Catálogo Faretto'}</h1>
      <p className="cat-desc">
        {filtered.length} producto{filtered.length === 1 ? '' : 's'} Faretto disponible{filtered.length === 1 ? '' : 's'}.
        Precios con stock verificado, sincronizados desde Power Energy por SKU.
      </p>

      <div className="cat-body">
        <aside className="filter-sidebar">
          <div className="filter-sidebar-heading">
            <span>Familia</span>
          </div>
          <div className="filter-tree">
            <button className={activeFamily === '' ? 'active' : ''} onClick={() => selectFamily('')}>
              Todas <span className="n">{productos.length}</span>
            </button>
            {FAMILIES.map((family) => (
              <button
                key={family.id}
                className={activeFamily === family.id ? 'active' : ''}
                onClick={() => selectFamily(family.id)}
              >
                {family.label} <span className="n">{familyCounts.get(family.id) || 0}</span>
              </button>
            ))}
          </div>
        </aside>

        <div>
          {visible.length === 0 ? (
            <div className="state-box">No hay productos en esta familia todavía.</div>
          ) : (
            <div className="product-sheet-list">
              {visible.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="pager">
              <span>{visible.length} de {filtered.length}</span>
              <button className="icon-btn" style={{ width: 'auto', borderRadius: 8, padding: '9px 14px' }} onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Cargar más
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
