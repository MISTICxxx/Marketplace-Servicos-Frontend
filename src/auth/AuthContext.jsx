import { useCallback, useEffect, useState } from 'react'
import AuthContext from './authContext.js'
import authService from '../services/authService.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [sessionRetry, setSessionRetry] = useState(0)

  useEffect(() => {
    let active = true
    authService.getCurrentUser().then((currentUser) => {
      if (active) {
        setUser(currentUser)
        setSessionError('')
      }
    }).catch((error) => {
      if (!active) return
      setUser(null)
      const status = error.response?.status
      if (!error.response) {
        setSessionError('Não foi possível conectar para validar sua sessão. Verifique a conexão e tente novamente.')
      } else if (status >= 500) {
        setSessionError('O serviço de autenticação está indisponível. Tente validar sua sessão novamente.')
      } else if (status === 403) {
        setSessionError('Sua sessão não pôde ser validada para esta conta. Tente novamente ou entre em outra conta.')
      } else {
        setSessionError('Não foi possível validar sua sessão. Tente novamente ou entre em outra conta.')
      }
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [sessionRetry])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setSessionError('')
    }
    window.addEventListener('fechou:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('fechou:unauthorized', handleUnauthorized)
  }, [])

  const retrySession = useCallback(() => setSessionRetry((current) => current + 1), [])

  async function createAccount(details) {
    const account = await authService.createAccount(details)
    setUser(account)
    setSessionError('')
    return account
  }

  async function login(details) {
    const account = await authService.signIn(details)
    setUser(account)
    setSessionError('')
    return account
  }

  async function updateProfile(changes) {
    if (!user) throw new Error('Entre para editar seu perfil.')
    const account = await authService.updateProfile(changes)
    setUser(account)
    return account
  }

  const logout = useCallback(() => {
    void authService.logout().catch(() => {})
    setUser(null)
    setSessionError('')
  }, [])

  return (
    <AuthContext.Provider value={{ createAccount, loading, login, logout, retrySession, sessionError, updateProfile, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider }
