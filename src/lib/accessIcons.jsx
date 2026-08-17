import { useEffect, useState } from 'react';
import { LayoutList } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Fuente de los iconos: https://lucide.dev/icons - el admin escribe el
// nombre tal como aparece ahi (kebab-case, ej "shopping-cart") en
// metadata.icono. Se carga bajo demanda con dynamicIconImports de
// lucide-react en vez de traer toda la libreria (~1500 iconos) al bundle -
// solo se descarga el .js del icono que realmente se usa.
const iconModuleCache = new Map();

export function AccessIcon({ name, size = 18 }) {
  const key = String(name || '').trim().toLowerCase();
  const [Icon, setIcon] = useState(() => iconModuleCache.get(key) || null);

  useEffect(() => {
    if (!key || !dynamicIconImports[key]) {
      setIcon(null);
      return;
    }
    if (iconModuleCache.has(key)) {
      setIcon(() => iconModuleCache.get(key));
      return;
    }
    let cancelled = false;
    dynamicIconImports[key]()
      .then((mod) => {
        if (cancelled) return;
        iconModuleCache.set(key, mod.default);
        setIcon(() => mod.default);
      })
      .catch(() => { if (!cancelled) setIcon(null); });
    return () => { cancelled = true; };
  }, [key]);

  const Resolved = Icon || LayoutList;
  return <Resolved size={size} />;
}
