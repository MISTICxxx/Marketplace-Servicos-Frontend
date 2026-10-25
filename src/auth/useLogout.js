import { useNavigate } from 'react-router-dom'
import useAuth from './useAuth.js'

/** Aplica a navegação pública antes de limpar a sessão para evitar corrida com a rota protegida. */
function useLogout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return function logoutAndReturnHome() {
    logout()
    navigate('/', { replace: true })
  }
}

export default useLogout
