import { Link } from 'react-router-dom'
import Navigation from './Navigation.jsx'

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Fechou! — página inicial">
          <span className="brand-mark" aria-hidden="true">f!</span>
          <span>Fechou!</span>
        </Link>
        <Navigation />
      </div>
    </header>
  )
}

export default Header
