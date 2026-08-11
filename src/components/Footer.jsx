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
          <a href="/catalogo">Catálogo completo</a>
          <a href="/catalogo?familia=plafones">Plafones</a>
          <a href="/catalogo?familia=luminaria-publica">Luminaria pública</a>
          <a href="/catalogo?familia=cintas-led">Cintas LED</a>
          <a href="/catalogo?familia=paneles-led">Paneles LED</a>
          <a href="/catalogo?familia=focos">Focos</a>
        </div>
        <div>
          <h4>Power Energy</h4>
          <a href="https://powerenergy.cl" target="_blank" rel="noreferrer">Sitio principal</a>
          <a href="https://powerenergy.cl/blog" target="_blank" rel="noreferrer">Blog</a>
          <a href="https://powerenergy.cl/pagina/empresa" target="_blank" rel="noreferrer">Empresa</a>
        </div>
        <div>
          <h4>Ayuda</h4>
          <a href="https://wa.me/" target="_blank" rel="noreferrer">Cotizar por WhatsApp</a>
          <a href="https://powerenergy.cl/pagina/terminos-y-condiciones" target="_blank" rel="noreferrer">Términos y condiciones</a>
        </div>
      </div>
      <div className="footer-legal">
        <span>Catálogo Faretto © {new Date().getFullYear()} — Power Energy</span>
        <a href="https://powerenergy.cl/pagina/politica-de-cookies" target="_blank" rel="noreferrer">Política de cookies</a>
      </div>
    </footer>
  );
}
