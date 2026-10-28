import { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard.jsx';
import { FAMILIES, resolveFamily, resolveModelo, modeloSlug, buildProductGroups, isLumex } from '../lib/api.js';
import { familyPath } from '../lib/routes.js';
import { usePageTitle, pageTitle, modeloHeading } from '../lib/seo.js';
import { NotFoundPage } from './NotFoundPage.jsx';

const PAGE_SIZE = 24;

// route viene de parseRoute (lib/routes.js): /catalogo, /catalogo/<familia>,
// /catalogo/<familia>/<modelo> (pagina propia del modelo) o /lumex.
export function CategoryPage({ productos, galeriaGrupos, route, onNavigate }) {
  const activeFamily = route.familia || '';
  const activeModeloSlug = route.name === 'modelo' ? route.modelo : '';
  // Lumex cruza varias familias reales (no es una familia propia, ver
  // isLumex en lib/api.js) - junta las ~11 fichas en una sola vista sin
  // sidebar de familia (no hay una familia unica que mostrar ahi).
  const isLumexView = route.name === 'lumex';
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
    const modelos = new Map();
    for (const product of byFamily) {
      const slug = modeloSlug(product.nombre);
      if (slug && !modelos.has(slug)) modelos.set(slug, { slug, label: resolveModelo(product.nombre) });
    }
    return [...modelos.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [byFamily, activeFamily, isLumexView]);

  const filtered = useMemo(() => {
    if (!activeModeloSlug) return byFamily;
    return byFamily.filter((product) => modeloSlug(product.nombre) === activeModeloSlug);
  }, [byFamily, activeModeloSlug]);
  const activeModelo = modelosDeLaFamilia.find((modelo) => modelo.slug === activeModeloSlug)?.label || '';

  // La ficha ahora es por "modelo" (1 foto + tabla de variantes), no por SKU
  // - varios SKU del feed se agrupan en una sola ficha (ver buildProductGroups).
  const fichas = useMemo(() => buildProductGroups(filtered, galeriaGrupos), [filtered, galeriaGrupos]);
  const visible = fichas.slice(0, visibleCount);
  const activeFamilyLabel = FAMILIES.find((family) => family.id === activeFamily)?.label;

  const modeloNoExiste = route.name === 'modelo' && !activeModelo;
  // Con modelo inexistente el titulo lo pone NotFoundPage (los efectos del
  // hijo corren antes que los del padre, asi que aca no se pisa).
  usePageTitle(modeloNoExiste ? null : pageTitle({ name: route.name, familia: activeFamilyLabel, modelo: activeModelo }));

  function selectFamily(familyId) {
    setVisibleCount(PAGE_SIZE);
    onNavigate(familyPath(familyId));
  }

  function selectModelo(slug) {
    setVisibleCount(PAGE_SIZE);
    onNavigate(activeModeloSlug === slug ? familyPath(activeFamily) : `${familyPath(activeFamily)}/${slug}`);
  }

  if (modeloNoExiste) return <NotFoundPage onNavigate={onNavigate} />;

  return (
    <>
      <div className="breadcrumb">
        Inicio <b>/</b> {isLumexView ? 'Lumex' : (activeModelo ? <><a href={familyPath(activeFamily)} onClick={(event) => { event.preventDefault(); selectFamily(activeFamily); }}>{activeFamilyLabel}</a> <b>/</b> Modelo {activeModelo}</> : (activeFamilyLabel || 'Catálogo Faretto'))}
      </div>

      {isLumexView ? (
        <div className="lumex-hero">
          <h1 className="lumex-hero-title">
            <img src="/assets/logo-lumex.webp" alt="Lumex — Iluminación y diseño" />
          </h1>
          <p>Línea Lumex dentro del catálogo Faretto: campanas industriales, paneles LED y equipos estancos.</p>
        </div>
      ) : (
        <h1 className="cat-title">{activeModelo ? modeloHeading(activeFamilyLabel, activeModelo) : (activeFamilyLabel || 'Catálogo Faretto')}</h1>
      )}

      <div className={`cat-body ${activeFamily && !isLumexView ? '' : 'cat-body-full'}`}>
        {activeFamily && !isLumexView && (
          <aside className="filter-sidebar">
            <div className="filter-tree">
              <a
                href={familyPath(activeFamily)}
                className={!activeModelo ? 'active' : ''}
                onClick={(event) => { event.preventDefault(); selectFamily(activeFamily); }}
              >
                {activeFamilyLabel}
              </a>
              {modelosDeLaFamilia.length > 0 && (
                <div className="filter-tree filter-tree-sub">
                  {/* Links reales (no solo botones) para que los buscadores
                      sigan la navegacion hacia cada pagina de modelo. */}
                  {modelosDeLaFamilia.map((modelo) => (
                    <a
                      key={modelo.slug}
                      href={`${familyPath(activeFamily)}/${modelo.slug}`}
                      className={activeModeloSlug === modelo.slug ? 'active' : ''}
                      onClick={(event) => { event.preventDefault(); selectModelo(modelo.slug); }}
                    >
                      {modelo.label}
                    </a>
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
