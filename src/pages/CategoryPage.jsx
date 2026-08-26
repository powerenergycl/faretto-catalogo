import { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard.jsx';
import { FAMILIES, resolveFamily, resolveModelo, buildProductGroups, isLumex } from '../lib/api.js';

const PAGE_SIZE = 24;

export function CategoryPage({ productos, galeriaGrupos, route, onNavigate }) {
  const params = new URLSearchParams(route.search);
  const activeFamily = params.get('familia') || '';
  const activeModelo = params.get('modelo') || '';
  // Lumex cruza varias familias reales (no es una familia propia, ver
  // isLumex en lib/api.js) - "marca" gana por sobre "familia"/"modelo" si
  // ambos vinieran en la URL, junta las ~11 fichas en una sola vista sin
  // sidebar de familia (no hay una familia unica que mostrar ahi).
  const activeMarca = params.get('marca') || '';
  const isLumexView = activeMarca === 'lumex';
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const byFamily = useMemo(() => {
    if (isLumexView) return productos.filter((product) => isLumex(product.nombre));
    if (!activeFamily) return productos;
    return productos.filter((product) => resolveFamily(product.nombre).id === activeFamily);
  }, [productos, activeFamily, isLumexView]);

  // El sidebar muestra unicamente la familia activa (nav de familia a
  // familia ya vive en el header) - solo hace falta el desglose de modelos
  // de esa familia puntual. No todas las familias traen "Modelo X" en el
  // nombre (ej. cintas LED nunca), asi que a veces queda vacio.
  const modelosDeLaFamilia = useMemo(() => {
    if (!activeFamily || isLumexView) return [];
    const modelos = new Set();
    for (const product of byFamily) {
      const modelo = resolveModelo(product.nombre);
      if (modelo) modelos.add(modelo);
    }
    return [...modelos].sort((a, b) => a.localeCompare(b));
  }, [byFamily, activeFamily, isLumexView]);

  const filtered = useMemo(() => {
    if (!activeModelo) return byFamily;
    return byFamily.filter((product) => resolveModelo(product.nombre) === activeModelo);
  }, [byFamily, activeModelo]);

  // La ficha ahora es por "modelo" (1 foto + tabla de variantes), no por SKU
  // - varios SKU del feed se agrupan en una sola ficha (ver buildProductGroups).
  const fichas = useMemo(() => buildProductGroups(filtered, galeriaGrupos), [filtered, galeriaGrupos]);
  const visible = fichas.slice(0, visibleCount);
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
        Inicio <b>/</b> {isLumexView ? 'Lumex' : (activeModelo ? <>{activeFamilyLabel} <b>/</b> Modelo {activeModelo}</> : (activeFamilyLabel || 'Catálogo Faretto'))}
      </div>

      {isLumexView ? (
        <div className="lumex-hero">
          <h1 className="lumex-hero-title">
            <img src="/assets/logo-lumex.webp" alt="Lumex — Iluminación y diseño" />
          </h1>
          <p>Línea Lumex dentro del catálogo Faretto: campanas industriales, paneles LED y equipos estancos.</p>
        </div>
      ) : (
        <h1 className="cat-title">{activeFamilyLabel || 'Catálogo Faretto'}</h1>
      )}

      <div className={`cat-body ${activeFamily && !isLumexView ? '' : 'cat-body-full'}`}>
        {activeFamily && !isLumexView && (
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
          {activeModelo && (
            <div className="cat-description cat-description-modelo">
              Modelo {activeModelo}
            </div>
          )}

          {visible.length === 0 ? (
            <div className="state-box">No hay productos en esta familia todavía.</div>
          ) : (
            <div className="product-sheet-list">
              {visible.map((ficha) => <ProductCard key={ficha.key} ficha={ficha} showLumexBadge={isLumexView} />)}
            </div>
          )}

          {visibleCount < fichas.length && (
            <div className="pager">
              <span>{visible.length} de {fichas.length}</span>
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
