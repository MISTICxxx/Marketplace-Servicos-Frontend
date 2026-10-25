import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import useLogout from '../auth/useLogout.js'
import { getInitials } from '../utils/accountNavigation.js'

const navigationItems = [
  { to: '/', label: 'Início', end: true },
  { to: '/servicos', label: 'Serviços' },
  { to: '/sobre', label: 'Sobre' },
]

function Navigation() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const logoutAndReturnHome = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const accountButtonRef = useRef(null)
  const isProviderProfile = pathname.startsWith('/prestadores/')

  useEffect(() => {
    if (!menuOpen) return undefined

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        accountButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  function handleLogout() {
    logoutAndReturnHome()
    setMenuOpen(false)
  }

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
        {user ? (
          <li className="account-menu" ref={menuRef}>
            <button
              aria-controls="account-menu-panel"
              aria-expanded={menuOpen}
              className="account-menu-trigger"
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
              ref={accountButtonRef}
              type="button"
            >
              <span aria-hidden="true" className="account-avatar">{getInitials(user.name)}</span>
              <span className="account-menu-name">{user.name}</span>
              <span aria-hidden="true" className="account-menu-chevron">⌄</span>
            </button>
            <div className="account-menu-panel" hidden={!menuOpen} id="account-menu-panel">
              <p className="account-menu-greeting">Sua conta</p>
              <NavLink
                aria-current={pathname.startsWith('/conversas') ? 'page' : undefined}
                className="account-menu-link"
                onClick={() => setMenuOpen(false)}
                to="/conversas"
              >
                Conversas
              </NavLink>
              <NavLink
                aria-current={pathname.startsWith('/meus-pedidos') ? 'page' : undefined}
                className="account-menu-link"
                onClick={() => setMenuOpen(false)}
                to="/meus-pedidos"
              >
                Meus pedidos
              </NavLink>
              <NavLink
                aria-current={pathname === '/minha-conta' ? 'page' : undefined}
                className="account-menu-link"
                onClick={() => setMenuOpen(false)}
                to="/minha-conta"
              >
                Meu perfil
              </NavLink>
              <button className="account-menu-link" onClick={handleLogout} type="button">
                Sair da conta
              </button>
            </div>
          </li>
        ) : (
          <>
            <li className="navigation-account-link">
              <Link className="navigation-link" to="/entrar">Entrar</Link>
            </li>
            <li className="navigation-account-link">
              <Link className="button button--primary navigation-signup" to="/cadastro">Criar conta</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navigation
