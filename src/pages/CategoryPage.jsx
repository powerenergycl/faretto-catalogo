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

  // El sidebar muestra unicamente la familia activa (nav de familia a
  // familia ya vive en el header) - solo hace falta el desglose de modelos
  // de esa familia puntual. No todas las familias traen "Modelo X" en el
  // nombre (ej. cintas LED nunca), asi que a veces queda vacio.
  const modelosDeLaFamilia = useMemo(() => {
    if (!activeFamily) return [];
    const modelos = new Set();
    for (const product of byFamily) {
      const modelo = resolveModelo(product.nombre);
      if (modelo) modelos.add(modelo);
    }
    return [...modelos].sort((a, b) => a.localeCompare(b));
  }, [byFamily, activeFamily]);

  const filtered = useMemo(() => {
    if (!activeModelo) return byFamily;
    return byFamily.filter((product) => resolveModelo(product.nombre) === activeModelo);
  }, [byFamily, activeModelo]);

  const visible = filtered.slice(0, visibleCount);
  const activeFamilyLabel = FAMILIES.find((family) => family.id === activeFamily)?.label;

  function selectFamily(familyId) {
    setVisibleCount(PAGE_SIZE);
    onNavigate(familyId ? `/catalogo?familia=${familyId}` : '/catalogo');
  }

  function selectModelo(modelo) {
    setVisibleCount(PAGE_SIZE);
    if (activeModelo === modelo) {
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
      <h1 className="cat-title">{activeFamilyLabel || 'Catálogo Faretto'}</h1>

      <div className={`cat-body ${activeFamily ? '' : 'cat-body-full'}`}>
        {activeFamily && (
          <aside className="filter-sidebar">
            <div className="filter-tree">
              <button className={!activeModelo ? 'active' : ''} onClick={() => selectFamily(activeFamily)}>
                {activeFamilyLabel}
              </button>
              {modelosDeLaFamilia.length > 0 && (
                <div className="filter-tree filter-tree-sub">
                  {modelosDeLaFamilia.map((modelo) => (
                    <button
                      key={modelo}
                      className={activeModelo === modelo ? 'active' : ''}
                      onClick={() => selectModelo(modelo)}
                    >
                      {modelo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        <div>
          {activeModelo && <h2 className="cat-modelo-title">Modelo {activeModelo}</h2>}

          <div className="cat-description">
            Descripción de la categoría {activeFamilyLabel ? `"${activeFamilyLabel}"` : ''} (próximamente editable desde el admin).
          </div>

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
