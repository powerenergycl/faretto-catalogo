import { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard.jsx';
import { FAMILIES, resolveFamily, resolveModelo } from '../lib/api.js';

const PAGE_SIZE = 24;

export function CategoryPage({ productos, route, onNavigate }) {
  const params = new URLSearchParams(route.search);
  const activeFamily = params.get('familia') || '';
  const activeModelo = params.get('modelo') || '';
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const byFamily = useMemo(() => {
    if (!activeFamily) return productos;
    return productos.filter((product) => resolveFamily(product.nombre).id === activeFamily);
  }, [productos, activeFamily]);

  // Arbol completo Familia -> Modelos, siempre expandido (no solo el de la
  // familia activa) - el sidebar ahora muestra la estructura entera de
  // entrada. No todas las familias traen "Modelo X" en el nombre (ej.
  // cintas LED nunca), asi que varias quedan sin submenu.
  const modelosByFamily = useMemo(() => {
    const map = new Map();
    for (const product of productos) {
      const modelo = resolveModelo(product.nombre);
      if (!modelo) continue;
      const familyId = resolveFamily(product.nombre).id;
      if (!map.has(familyId)) map.set(familyId, new Set());
      map.get(familyId).add(modelo);
    }
    for (const [familyId, modelos] of map) {
      map.set(familyId, [...modelos].sort((a, b) => a.localeCompare(b)));
    }
    return map;
  }, [productos]);

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

  function selectModelo(familyId, modelo) {
    setVisibleCount(PAGE_SIZE);
    if (activeFamily === familyId && activeModelo === modelo) {
      onNavigate(`/catalogo?familia=${familyId}`);
    } else {
      onNavigate(`/catalogo?familia=${familyId}&modelo=${encodeURIComponent(modelo)}`);
    }
  }

  return (
    <>
      <div className="breadcrumb">
        Inicio <b>/</b> {activeModelo ? <>{activeFamilyLabel} <b>/</b> Modelo {activeModelo}</> : (activeFamilyLabel || 'Catálogo Faretto')}
      </div>
      <h1 className="cat-title">{pageTitle || 'Catálogo Faretto'}</h1>

      <div className="cat-description">
        Descripción de la categoría {activeFamilyLabel ? `"${activeFamilyLabel}"` : ''} (próximamente editable desde el admin).
      </div>

      <div className="cat-body">
        <aside className="filter-sidebar">
          <div className="filter-sidebar-heading">
            <span>Familia</span>
          </div>
          <div className="filter-tree">
            {FAMILIES.map((family) => {
              const modelos = modelosByFamily.get(family.id) || [];
              return (
                <div key={family.id}>
                  <button
                    className={activeFamily === family.id && !activeModelo ? 'active' : ''}
                    onClick={() => selectFamily(family.id)}
                  >
                    {family.label}
                  </button>
                  {modelos.length > 0 && (
                    <div className="filter-tree filter-tree-sub">
                      {modelos.map((modelo) => (
                        <button
                          key={modelo}
                          className={activeFamily === family.id && activeModelo === modelo ? 'active' : ''}
                          onClick={() => selectModelo(family.id, modelo)}
                        >
                          {modelo}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
