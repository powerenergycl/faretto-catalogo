import { useState } from 'react';
import { MessageCircle, ShoppingCart, Users2, LifeBuoy, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import { submitFarettoContacto } from '../lib/api.js';

// Mismas categorias que el selector "Asunto" de la referencia entregada por
// el cliente (Ventas al mayor / Distribuidor / Información y Productos /
// Soporte y Productos / Otro) -- se reusan tal cual, tanto en el select
// como en los bullets del panel izquierdo, para no inventar categorias
// nuevas que el formulario original no tenia.
const ASUNTOS = [
  { value: 'ventas-mayor', label: 'Ventas al mayor', icon: ShoppingCart },
  { value: 'distribuidor', label: 'Quiero ser distribuidor', icon: Users2 },
  { value: 'informacion-productos', label: 'Información / Productos', icon: HelpCircle },
  { value: 'soporte-productos', label: 'Soporte / Productos', icon: LifeBuoy },
  { value: 'otro', label: 'Otro', icon: MessageCircle }
];

const EMPTY_FORM = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };

export function ContactoPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await submitFarettoContacto(form);
      setStatus('sent');
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="contact-page">
      <div className="breadcrumb">Inicio <b>/</b> Contacto</div>
      <div className="contact-card">
        <aside className="contact-panel">
          <span className="contact-panel-kicker">Faretto Illuminazione</span>
          <h1>Hablemos de tu proyecto</h1>
          <p>Cuéntanos qué necesitas y un especialista de nuestro equipo te contacta a la brevedad.</p>

          <ul className="contact-panel-list">
            {ASUNTOS.filter((item) => item.value !== 'otro').map(({ value, label, icon: Icon }) => (
              <li key={value}><Icon size={17} /> {label}</li>
            ))}
          </ul>

          <a className="contact-whatsapp" href="https://wa.me/" target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> Escríbenos por WhatsApp
          </a>
        </aside>

        <div className="contact-form-wrap">
          {status === 'sent' ? (
            <div className="contact-success">
              <CheckCircle2 size={36} />
              <h2>¡Mensaje enviado!</h2>
              <p>Gracias por escribirnos. Te contactaremos a la brevedad.</p>
              <button type="button" className="ghost-button-teal" onClick={() => setStatus('idle')}>Enviar otro mensaje</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Déjanos tu mensaje</h2>
              <label>
                <span>Nombre</span>
                <input value={form.nombre} onChange={(event) => updateField('nombre', event.target.value)} placeholder="Tu nombre" required />
              </label>
              <div className="contact-form-split">
                <label>
                  <span>Correo</span>
                  <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="tu@correo.cl" required />
                </label>
                <label>
                  <span>Teléfono</span>
                  <input type="tel" value={form.telefono} onChange={(event) => updateField('telefono', event.target.value)} placeholder="+56 9 1234 5678" />
                </label>
              </div>
              <label>
                <span>Asunto</span>
                <select value={form.asunto} onChange={(event) => updateField('asunto', event.target.value)} required>
                  <option value="" disabled>Selecciona un asunto</option>
                  {ASUNTOS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>Mensaje</span>
                <textarea rows={5} value={form.mensaje} onChange={(event) => updateField('mensaje', event.target.value)} placeholder="Cuéntanos en qué te podemos ayudar" required />
              </label>
              {status === 'error' && <div className="contact-error">{error}</div>}
              <button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando…' : <>Enviar <Send size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
