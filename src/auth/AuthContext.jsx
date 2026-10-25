import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AuthContext from './authContext.js'
import authService from '../services/authService.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [logoutPending, setLogoutPending] = useState(false)
  const logoutTimerRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (!logoutPending || location.pathname !== '/') return

    logoutTimerRef.current = window.setTimeout(() => {
      authService.logout()
      setUser(null)
      setLogoutPending(false)
      logoutTimerRef.current = null
    }, 0)
  }, [location.pathname, logoutPending])

  function cancelPendingLogout() {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
    setLogoutPending(false)
  }

  function createAccount(details) {
    const account = authService.createAccount(details)
    cancelPendingLogout()
    setUser(account)
    return account
  }

  function login(details) {
    const account = authService.signIn(details)
    cancelPendingLogout()
    setUser(account)
    return account
  }

  function loginDemo() {
    const account = authService.signInDemo()
    cancelPendingLogout()
    setUser(account)
    return account
  }

  function updateProfile(changes) {
    if (!user) throw new Error('Entre para editar seu perfil.')
    const account = authService.updateProfile(user.id, changes)
    setUser(account)
    return account
  }

  const logout = useCallback(() => {
    setLogoutPending(true)
  }, [])

  const value = {
    createAccount,
    login,
    loginDemo,
    logout,
    updateProfile,
    user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
