import { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import { fetchFarettoDistribuidores } from '../lib/api.js';

// Orden de despliegue de las zonas: "Santiago RM" siempre primero (asi vino
// la lista original del cliente), cualquier otra zona que se agregue despues
// cae ordenada alfabeticamente a continuacion.
const ZONE_PRIORITY = ['Santiago RM'];

function groupByZone(distribuidores) {
  const byZone = new Map();
  distribuidores.forEach((item) => {
    const zone = item.zona || 'Otros';
    if (!byZone.has(zone)) byZone.set(zone, []);
    byZone.get(zone).push(item);
  });

  const zones = [...byZone.keys()].sort((a, b) => {
    const ia = ZONE_PRIORITY.indexOf(a);
    const ib = ZONE_PRIORITY.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b, 'es');
  });

  return zones.map((zone) => ({ zone, items: byZone.get(zone) }));
}

function DistributorCard({ item }) {
  const phoneHref = item.telefono ? `tel:${item.telefono.replace(/[^\d+]/g, '')}` : null;
  return (
    <article className="distributor-card">
      <div className="distributor-card-head">
        <span className="distributor-card-icon"><Building2 size={18} /></span>
        <strong>{item.nombre}</strong>
      </div>
      <div className="distributor-card-body">
        {item.direccion && (
          <span><MapPin size={15} /> {item.direccion}</span>
        )}
        {item.telefono && (
          <a href={phoneHref}><Phone size={15} /> {item.telefono}</a>
        )}
        {item.email && (
          <a href={`mailto:${item.email}`}><Mail size={15} /> {item.email}</a>
        )}
      </div>
    </article>
  );
}

export function DistribuidoresPage() {
  const [distribuidores, setDistribuidores] = useState(null); // null = todavia no respondio

  useEffect(() => {
    let cancelled = false;
    fetchFarettoDistribuidores()
      .then((data) => { if (!cancelled) setDistribuidores(data); })
      .catch(() => { if (!cancelled) setDistribuidores([]); });
    return () => { cancelled = true; };
  }, []);

  const groups = distribuidores ? groupByZone(distribuidores) : [];

  return (
    <>
      <div className="breadcrumb">Inicio <b>/</b> Distribuidores</div>
      <h1 className="cat-title">Distribuidores</h1>
      <p className="cat-description">
        Encuentra el distribuidor autorizado Faretto más cercano a ti. Todos cuentan con nuestro respaldo técnico y stock de productos originales.
      </p>

      {distribuidores === null ? (
        <div className="state-box">Cargando distribuidores…</div>
      ) : groups.length === 0 ? (
        <div className="state-box">Todavía no hay distribuidores publicados.</div>
      ) : (
        groups.map(({ zone, items }) => (
          <section className="distributor-zone" key={zone}>
            <div className="home-section-heading">
              <h2>{zone}</h2>
              <p>{items.length} distribuidor{items.length === 1 ? '' : 'es'}</p>
            </div>
            <div className="distributor-grid">
              {items.map((item, index) => <DistributorCard item={item} key={`${item.nombre}-${index}`} />)}
            </div>
          </section>
        ))
      )}
    </>
  );
}
