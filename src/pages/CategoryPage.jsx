import { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard.jsx';
import { FAMILIES, resolveFamily, resolveModelo } from '../lib/api.js';

const PAGE_SIZE = 24;

export function CategoryPage({ productos, route, onNavigate }) {
  const params = new URLSearchParams(route.search);
  const activeFamily = params.get('familia') || '';
  const activeModelo = params.get('modelo') || '';
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const familyCounts = useMemo(() => {
    const counts = new Map();
    for (const product of productos) {
      const family = resolveFamily(product.nombre);
      counts.set(family.id, (counts.get(family.id) || 0) + 1);
    }
    return counts;
  }, [productos]);

  const byFamily = useMemo(() => {
    if (!activeFamily) return productos;
    return productos.filter((product) => resolveFamily(product.nombre).id === activeFamily);
  }, [productos, activeFamily]);

  // Submenu de modelos: solo tiene sentido dentro de una familia activa, y
  // solo si al menos un producto de esa familia trae "Modelo X" en el
  // nombre (varias familias, ej. cintas LED, nunca lo traen).
  const modelos = useMemo(() => {
    if (!activeFamily) return [];
    const counts = new Map();
    for (const product of byFamily) {
      const modelo = resolveModelo(product.nombre);
      if (!modelo) continue;
      counts.set(modelo, (counts.get(modelo) || 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [byFamily, activeFamily]);

  const filtered = useMemo(() => {
    if (!activeModelo) return byFamily;
    return byFamily.filter((product) => resolveModelo(product.nombre) === activeModelo);
  }, [byFamily, activeModelo]);

  const visible = filtered.slice(0, visibleCount);
  const activeFamilyLabel = FAMILIES.find((family) => family.id === activeFamily)?.label;
  const pageTitle = activeModelo && activeFamilyLabel ? `${activeFamilyLabel} · Modelo ${activeModelo}` : activeFamilyLabel;

  function selectFamily(familyId) {
    setVisibleCount(PAGE_SIZE);
    onNavigate(familyId ? `/catalogo?familia=${familyId}` : '/catalogo');
  }

  function selectModelo(modelo) {
    setVisibleCount(PAGE_SIZE);
    if (modelo === activeModelo) {
      onNavigate(`/catalogo?familia=${activeFamily}`);
    } else {
      onNavigate(`/catalogo?familia=${activeFamily}&modelo=${encodeURIComponent(modelo)}`);
    }
  }

  return (
    <>
      <div className="breadcrumb">
        Inicio <b>/</b> {activeModelo ? <>{activeFamilyLabel} <b>/</b> Modelo {activeModelo}</> : (activeFamilyLabel || 'Catálogo Faretto')}
      </div>
      <h1 className="cat-title">{pageTitle || 'Catálogo Faretto'}</h1>

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
              <div key={family.id}>
                <button
                  className={activeFamily === family.id ? 'active' : ''}
                  onClick={() => selectFamily(family.id)}
                >
                  {family.label} <span className="n">{familyCounts.get(family.id) || 0}</span>
                </button>
                {activeFamily === family.id && modelos.length > 0 && (
                  <div className="filter-tree filter-tree-sub">
                    {modelos.map(([modelo, count]) => (
                      <button
                        key={modelo}
                        className={activeModelo === modelo ? 'active' : ''}
                        onClick={() => selectModelo(modelo)}
                      >
                        {modelo} <span className="n">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
