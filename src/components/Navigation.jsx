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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigationRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)
  const menuRef = useRef(null)
  const accountButtonRef = useRef(null)
  const isProviderProfile = pathname.startsWith('/prestadores/')

  useEffect(() => {
    if (!menuOpen && !mobileMenuOpen) return undefined

    function handlePointerDown(event) {
      if (!navigationRef.current?.contains(event.target)) {
        setMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setMobileMenuOpen(false)
        if (mobileMenuOpen) mobileMenuButtonRef.current?.focus()
        else accountButtonRef.current?.focus()
      }
    }

    function handleHistoryNavigation() {
      setMenuOpen(false)
      setMobileMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('popstate', handleHistoryNavigation)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', handleHistoryNavigation)
    }
  }, [menuOpen, mobileMenuOpen])

  function handleLogout() {
    logoutAndReturnHome()
    setMenuOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <nav
      className={`main-navigation${mobileMenuOpen ? ' is-mobile-open' : ''}`}
      aria-label="Navegação principal"
      ref={navigationRef}
    >
      <button
        aria-controls="primary-navigation-list"
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        className="mobile-menu-toggle"
        onClick={() => {
          setMobileMenuOpen((isOpen) => !isOpen)
          setMenuOpen(false)
        }}
        ref={mobileMenuButtonRef}
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <ul className="navigation-list" id="primary-navigation-list">
        {navigationItems.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              aria-current={isProviderProfile && to === '/servicos' ? 'page' : undefined}
              className={({ isActive }) => `navigation-link${isActive || (isProviderProfile && to === '/servicos') ? ' is-active' : ''}`}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
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
              {user.role === 'provider' ? (
                <>
                  <NavLink aria-current={pathname === '/painel-prestador' ? 'page' : undefined} className="account-menu-link" onClick={() => { setMenuOpen(false); setMobileMenuOpen(false) }} to="/painel-prestador">Painel profissional</NavLink>
                  <NavLink aria-current={pathname.startsWith('/conversas') ? 'page' : undefined} className="account-menu-link" onClick={() => { setMenuOpen(false); setMobileMenuOpen(false) }} to="/conversas">Conversas com clientes</NavLink>
                  <NavLink aria-current={pathname.startsWith('/contratacoes') ? 'page' : undefined} className="account-menu-link" onClick={() => { setMenuOpen(false); setMobileMenuOpen(false) }} to="/contratacoes">Ordens de serviço</NavLink>
                </>
              ) : (
                <>
                  <NavLink
                aria-current={pathname.startsWith('/conversas') ? 'page' : undefined}
                className="account-menu-link"
                onClick={() => { setMenuOpen(false); setMobileMenuOpen(false) }}
                to="/conversas"
              >
                Conversas
              </NavLink>
              <NavLink
                aria-current={pathname.startsWith('/meus-pedidos') ? 'page' : undefined}
                className="account-menu-link"
                onClick={() => { setMenuOpen(false); setMobileMenuOpen(false) }}
                to="/meus-pedidos"
              >
                Meus pedidos
              </NavLink>
              <NavLink aria-current={pathname.startsWith('/contratacoes') ? 'page' : undefined} className="account-menu-link" onClick={() => { setMenuOpen(false); setMobileMenuOpen(false) }} to="/contratacoes">Contratações</NavLink>
                </>
              )}
              <NavLink
                aria-current={pathname === '/minha-conta' ? 'page' : undefined}
                className="account-menu-link"
                onClick={() => { setMenuOpen(false); setMobileMenuOpen(false) }}
                to="/minha-conta"
              >
                {user.role === 'provider' ? 'Dados da conta' : 'Meu perfil'}
              </NavLink>
              <button className="account-menu-link" onClick={handleLogout} type="button">
                Sair da conta
              </button>
            </div>
          </li>
        ) : (
          <>
            <li className="navigation-account-link">
              <Link className="navigation-link" onClick={() => setMobileMenuOpen(false)} to="/entrar">Entrar</Link>
            </li>
            <li className="navigation-account-link">
              <Link className="button button--primary navigation-signup" onClick={() => setMobileMenuOpen(false)} to="/cadastro">Criar conta</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navigation
