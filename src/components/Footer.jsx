export function Footer() {
  return (
    <footer className="store-footer">
      <div className="footer-grid">
        <div>
          <h4>Faretto</h4>
          <p>Illuminazione e Design, distribuido por Power Energy.</p>
        </div>
        <div>
          <h4>Catálogo</h4>
          <a href="/catalogo?familia=plafones">Plafones</a>
          <a href="/catalogo?familia=luminaria-publica">Luminaria pública</a>
          <a href="/catalogo?familia=paneles-led">Paneles LED</a>
        </div>
        <div>
          <h4>Ayuda</h4>
          <a href="https://wa.me/" target="_blank" rel="noreferrer">Cotizar por WhatsApp</a>
        </div>
      </div>
      <div className="footer-legal">Catálogo Faretto © {new Date().getFullYear()} — Power Energy</div>
    </footer>
  );
}
