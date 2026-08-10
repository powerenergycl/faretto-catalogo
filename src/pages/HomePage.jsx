import { FAMILIES, resolveFamily } from '../lib/api.js';

// Un producto de muestra por familia para el thumbnail circular - toma el
// primero que matchee en la lista ya cargada, así no depende de imagenes
// fijas en el repo ni de un endpoint aparte.
function pickFamilyThumbnails(productos) {
  return FAMILIES.map((family) => {
    const sample = productos.find((product) => resolveFamily(product.nombre).id === family.id && product.imagen);
    const count = productos.filter((product) => resolveFamily(product.nombre).id === family.id).length;
    return { ...family, imagen: sample?.imagen || null, count };
  });
}

export function HomePage({ productos, onNavigate }) {
  const familyThumbnails = pickFamilyThumbnails(productos);

  return (
    <>
      <div className="round-category-strip">
        {familyThumbnails.map((family) => (
          <a
            key={family.id}
            className="round-category"
            href={`/catalogo?familia=${family.id}`}
            onClick={(event) => { event.preventDefault(); onNavigate(`/catalogo?familia=${family.id}`); }}
          >
            <span>
              {family.imagen ? <img src={family.imagen} alt={family.label} /> : null}
            </span>
            <strong>{family.label} ({family.count})</strong>
          </a>
        ))}
      </div>

      <div className="home-seo-intro">
        <h1>Iluminación técnica Faretto en Chile</h1>
        <p>
          Catálogo Faretto disponible en Power Energy: plafones, paneles LED, luminaria pública y cintas LED
          con ficha técnica, stock y despacho a todo Chile.
        </p>
      </div>
    </>
  );
}
