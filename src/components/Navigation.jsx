import { NavLink, useLocation } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Início', end: true },
  { to: '/servicos', label: 'Serviços' },
  { to: '/sobre', label: 'Sobre' },
]

function Navigation() {
  const { pathname } = useLocation()
  const isProviderProfile = pathname.startsWith('/prestadores/')

  return (
    <nav className="main-navigation" aria-label="Navegação principal">
      <ul className="navigation-list">
        {navigationItems.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              aria-current={isProviderProfile && to === '/servicos' ? 'page' : undefined}
              className={({ isActive }) => `navigation-link${isActive || (isProviderProfile && to === '/servicos') ? ' is-active' : ''}`}
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
