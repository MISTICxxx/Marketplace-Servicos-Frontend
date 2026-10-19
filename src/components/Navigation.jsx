import { NavLink } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Início', end: true },
  { to: '/servicos', label: 'Serviços' },
  { to: '/sobre', label: 'Sobre' },
]

function Navigation() {
  return (
    <nav className="main-navigation" aria-label="Navegação principal">
      <ul className="navigation-list">
        {navigationItems.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              className="navigation-link"
              end={end}
              to={to}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
