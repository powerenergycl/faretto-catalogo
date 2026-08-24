---
name: ficha-attributes
description: Audita o explica cómo se reparten los atributos de una ficha Faretto entre los íconos compartidos y la tabla de variantes. Úsalo cuando se pida revisar, corregir o verificar qué specs van como ícono vs. columna de tabla en el catálogo Faretto, o cuando se toque buildProductGroups/buildFichaFromGroup en src/lib/api.js.
---

# Distribución de atributos en la ficha Faretto

Cada ficha de producto agrupa varios SKU que son la misma pieza física en
distintas variantes (potencia, temperatura de color). Para casi todos los
atributos, la regla es por **si el valor es igual en TODOS los SKU del
grupo o no** — pero hay una lista fija y deliberada de excepciones
(`SPEC_LABELS_ALWAYS_TABLE`, ver más abajo) que van siempre a tabla aunque
no varíen. Fuera de esa lista, no hardcodear nada más.

## La regla

1. **Ícono compartido** (arriba de la ficha, se muestra una sola vez): el
   atributo tiene el mismo valor, normalizado (case/espacios), en **todos**
   los miembros del grupo, Y no está en `SPEC_LABELS_ALWAYS_TABLE`. Ejemplos
   típicos: Voltaje, CRI, Garantía, Driver, Grado de Protección — cualquier
   atributo fuera de la lista fija puede terminar aquí si de hecho no varía
   en ese modelo puntual.
2. **Columna de tabla** (una fila por variante): el atributo varía entre al
   menos dos SKU del grupo, o falta en algunos y está presente en otros — O
   está en `SPEC_LABELS_ALWAYS_TABLE` (hoy: **Potencia** y **Medidas**,
   pedido explícito de negocio 2026-08-24: el catálogo siempre quiere verlas
   en la tabla de variantes, aunque un modelo puntual solo venga en una
   potencia/medida y "podría" ascender a ícono).
3. **SKU y Temperatura** son siempre parte de la tabla, nunca íconos — SKU
   porque identifica la fila, Temperatura porque es la dimensión que se
   apila dentro de cada fila (varios SKU comparten fila si solo difieren en
   temperatura de color).
4. **"Tipo de Luz"** se descarta siempre (ícono y tabla) — es redundante con
   Temperatura (mismo dato en palabras en vez de Kelvin).
5. Las **filas** de la tabla se agrupan por el valor de **Potencia** (si
   existe) — es la dimensión que en la práctica define "variante de tamaño"
   en este catálogo. Dentro de cada fila, los SKU se apilan ordenados por
   Temperatura descendente (más frío primero, ej. 6500K, 6000K, 4000K,
   3000K).
6. El **título** de la ficha (`ficha.titulo`) ya NO incluye "Modelo X" — el
   modelo se muestra aparte (barra superior de la ficha / breadcrumb de
   `CategoryPage.jsx`), así que repetirlo en cada tarjeta agrupada bajo esa
   barra era redundante.

## Dónde vive esto

Toda la lógica está en `src/lib/api.js`:
- `buildProductGroups(productos)` agrupa el feed plano por SKU en fichas por
  modelo (familia + modelo + nombre genérico limpio de specs variables).
- `buildFichaFromGroup(group)` hace la clasificación ícono/tabla descrita
  arriba y arma las filas.

`ProductCard.jsx` solo renderiza `ficha.sharedSpecs` (íconos) y
`ficha.columns`/`ficha.rows` (tabla) — no tiene lógica de clasificación
propia.

## Cómo auditar (verificar que no haya inconsistencias)

Bajar el feed público y correr `buildProductGroups` contra él, chequeando
que ningún spec realmente constante haya quedado en `columns` (salvo
Potencia/Medidas, que deben estar ahí siempre) y que ningún spec que
realmente varía haya quedado en `sharedSpecs` (y que Potencia/Medidas nunca
terminen en `sharedSpecs`):

```bash
curl -s https://powerenergy.cl/api/public/faretto-productos -o feed.json
```

```js
// api.js usa import.meta.env (Vite) - para correrlo en Node plano, hacer una
// copia reemplazando esa línea por un valor fijo antes de importar:
//   sed "s|import.meta.env.VITE_SITIO_POWER_API_BASE|undefined|" src/lib/api.js > api-test.mjs

import { buildProductGroups } from './api-test.mjs';
import fs from 'fs';
const { productos } = JSON.parse(fs.readFileSync('./feed.json', 'utf8'));
const groups = buildProductGroups(productos);

const ALWAYS_TABLE = new Set(['potencia', 'medidas']); // ver SPEC_LABELS_ALWAYS_TABLE en api.js
let problems = 0;
for (const g of groups) {
  for (const col of g.columns) {
    const values = g.members.map(m => (m.specs || []).find(s => s.label === col)?.valor);
    const norm = values.map(v => String(v || '').trim().toLowerCase());
    if (norm[0] && norm.every(v => v === norm[0]) && !ALWAYS_TABLE.has(col.toLowerCase())) {
      console.log('DEBERIA SER ICONO pero quedo en tabla:', g.titulo, '|', col);
      problems++;
    }
  }
  for (const s of g.sharedSpecs) {
    const values = g.members.map(m => (m.specs || []).find(x => x.label === s.label)?.valor);
    const norm = values.map(v => String(v || '').trim().toLowerCase());
    if (!(norm[0] && norm.every(v => v === norm[0])) || ALWAYS_TABLE.has(s.label.toLowerCase())) {
      console.log('DEBERIA SER TABLA pero quedo en icono:', g.titulo, '|', s.label);
      problems++;
    }
  }
}
console.log('grupos:', groups.length, '| problemas:', problems);
```

`problems` debe dar `0`. Si no, el bug está en `buildFichaFromGroup`
(comparación de valores, probablemente sin normalizar mayúsculas/espacios —
ya pasó una vez, ver `normalizeForKey` en el mismo archivo).

## Qué NO hacer

- No agregar más labels a `SPEC_LABELS_ALWAYS_TABLE` sin que sea un pedido
  explícito de negocio — la regla por defecto sigue siendo "varía → tabla,
  constante → ícono"; Potencia/Medidas son una excepción documentada, no el
  patrón a seguir para cualquier atributo nuevo.
- No tocar la clasificación sin volver a correr la auditoría de arriba
  contra datos reales del feed.
