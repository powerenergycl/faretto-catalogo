import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, ImageOff, ArrowRight } from 'lucide-react';
import { FAMILIES, resolveFamily, resolveModelo } from '../lib/api.js';

// Buscador conversacional local - NO es un chatbot con IA real: busca por
// texto en el mismo catalogo ya cargado (fetchFarettoProductos, App.jsx) y
// responde con look de chat. Reemplaza al icono de WhatsApp del header
// (pedido del 27-08-2026) - "hablar con un asesor" queda como salida dentro
// de las respuestas del bot, no como boton propio en el header.
const GREETING = '¡Hola! 👋 Escribe un modelo, SKU o tipo de producto — por ejemplo "plafón redondo", "campana UFO" o "2105".';

const SUGGESTIONS = ['Plafones', 'Focos', 'Paneles LED', 'Campanas LED', 'Cintas LED'];

function normalize(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Puntaje simple por coincidencia de texto - no es busqueda semantica, solo
// SKU exacto / substring del nombre / cuantas palabras de la consulta
// aparecen en el nombre. Alcanza para un catalogo de ~330 SKU.
function scoreProduct(product, queryNorm, queryWords) {
  const nombreNorm = normalize(product.nombre);
  const skuNorm = normalize(product.sku || '');
  let score = 0;
  if (skuNorm && skuNorm === queryNorm) score += 10;
  else if (skuNorm && queryNorm.includes(skuNorm)) score += 6;
  if (nombreNorm.includes(queryNorm)) score += 5;
  queryWords.forEach((word) => { if (word.length > 2 && nombreNorm.includes(word)) score += 1; });
  return score;
}

function searchProducts(productos, query) {
  const queryNorm = normalize(query);
  if (!queryNorm) return [];
  const queryWords = queryNorm.split(/\s+/).filter(Boolean);

  // Si la consulta calza con el nombre de una familia (ej. "focos",
  // "paneles led"), se prioriza esa familia completa por sobre el
  // matching de texto suelto - es la intencion mas probable.
  const familyMatch = FAMILIES.find((familia) => normalize(familia.label).includes(queryNorm) || queryNorm.includes(normalize(familia.label)));

  const scored = productos
    .map((product) => ({
      product,
      score: familyMatch
        ? (resolveFamily(product.nombre).id === familyMatch.id ? 5 : 0)
        : scoreProduct(product, queryNorm, queryWords)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  // Un modelo trae varias potencias/temperaturas (mismo SKU base) - de-dup
  // por familia+modelo+score para no repetir la misma pieza 4 veces en los
  // resultados, se prefiere variedad de piezas distintas.
  const seen = new Set();
  const results = [];
  for (const { product } of scored) {
    const familia = resolveFamily(product.nombre);
    const modelo = resolveModelo(product.nombre);
    const key = `${familia.id}::${modelo || product.nombre}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ product, familia, modelo });
    if (results.length >= 5) break;
  }
  return results;
}

function ResultCard({ result, onNavigate, onClose }) {
  const { product, familia, modelo } = result;
  const href = modelo
    ? `/catalogo?familia=${familia.id}&modelo=${encodeURIComponent(modelo)}`
    : `/catalogo?familia=${familia.id}`;
  return (
    <a
      className="chat-result-card"
      href={href}
      onClick={(event) => { event.preventDefault(); onClose(); onNavigate(href); }}
    >
      <span className="chat-result-thumb">
        {product.imagen ? <img src={product.imagen} alt="" loading="lazy" /> : <ImageOff size={16} />}
      </span>
      <span className="chat-result-copy">
        <strong>{product.nombre}</strong>
        <small>{familia.label}{modelo ? ` · Modelo ${modelo}` : ''}</small>
      </span>
      <ArrowRight size={14} className="chat-result-arrow" />
    </a>
  );
}

export function ChatSearchWidget({ productos = [], onNavigate }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: GREETING }]);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, open]);

  const runSearch = (rawQuery) => {
    const query = rawQuery.trim();
    if (!query) return;
    const results = searchProducts(productos, query);
    setMessages((current) => [
      ...current,
      { role: 'user', text: query },
      results.length > 0
        ? { role: 'bot', text: `Encontré ${results.length === 1 ? 'esto' : `estas ${results.length} opciones`} para "${query}":`, results }
        : {
          role: 'bot',
          text: `No encontré productos para "${query}". Prueba con otro modelo, SKU o tipo de producto, o `,
          whatsapp: true
        }
    ]);
    setInput('');
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Buscador Faretto">
          <div className="chat-panel-head">
            <span><MessageCircle size={16} /> Buscador Faretto</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar buscador"><X size={18} /></button>
          </div>
          <div className="chat-log" ref={logRef}>
            {messages.map((message, index) => (
              <div className={`chat-bubble chat-bubble-${message.role}`} key={index}>
                <p>
                  {message.text}
                  {message.whatsapp && (
                    <a href="https://wa.me/" target="_blank" rel="noreferrer">habla con un asesor por WhatsApp</a>
                  )}
                  {message.whatsapp && '.'}
                </p>
                {message.results && (
                  <div className="chat-results">
                    {message.results.map((result) => (
                      <ResultCard result={result} onNavigate={onNavigate} onClose={() => setOpen(false)} key={`${result.familia.id}-${result.modelo || result.product.id}`} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((label) => (
                  <button type="button" key={label} onClick={() => runSearch(label)}>{label}</button>
                ))}
              </div>
            )}
          </div>
          <form
            className="chat-input-row"
            onSubmit={(event) => { event.preventDefault(); runSearch(input); }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Modelo, SKU o tipo de producto…"
              aria-label="Buscar producto"
            />
            <button type="submit" aria-label="Buscar"><Send size={16} /></button>
          </form>
        </div>
      )}
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Cerrar buscador' : 'Abrir buscador'}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
