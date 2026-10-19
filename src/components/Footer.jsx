import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-copy">
          Fechou! — uma base para aproximar quem precisa de um serviço de quem pode realizá-lo.
        </p>
        <nav className="footer-links" aria-label="Links úteis">
          <Link to="/sobre">Sobre o projeto</Link>
          <Link to="/diagnostico-api">Diagnóstico da API</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
