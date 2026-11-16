import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from '../App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import authService from '../services/authService.js'

vi.mock('../services/authService.js', () => ({
  default: {
    createAccount: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    signIn: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

const providerUser = { id: 'provider-test-1', name: 'Profissional de Teste', role: 'provider' }
const customerUser = { id: 'customer-test-1', name: 'Cliente de Teste', role: 'customer' }

function renderProtectedRoute(role = 'provider') {
  return render(
    <MemoryRouter initialEntries={['/privado']}>
      <AuthProvider>
        <Routes>
          <Route path="/privado" element={<ProtectedRoute role={role}><p>conteúdo privado</p></ProtectedRoute>} />
          <Route path="/entrar" element={<p>rota de login</p>} />
          <Route path="/meus-pedidos" element={<p>rota de cliente</p>} />
          <Route path="/painel-prestador" element={<p>rota de prestador</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('restauração de sessão e rotas protegidas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redireciona para login quando a sessão foi validada como ausente', async () => {
    authService.getCurrentUser.mockResolvedValueOnce(null)
    renderProtectedRoute()

    expect(await screen.findByText('rota de login')).not.toBeNull()
    expect(screen.queryByText('conteúdo privado')).toBeNull()
  })

  it('redireciona a pessoa autenticada para a área compatível com seu papel', async () => {
    authService.getCurrentUser.mockResolvedValueOnce(customerUser)
    renderProtectedRoute('provider')

    expect(await screen.findByText('rota de cliente')).not.toBeNull()
    expect(screen.queryByText('conteúdo privado')).toBeNull()
  })

  it('remove o conteúdo privado quando a API invalida a sessão ativa', async () => {
    authService.getCurrentUser.mockResolvedValueOnce(providerUser)
    renderProtectedRoute()
    expect(await screen.findByText('conteúdo privado')).not.toBeNull()

    window.dispatchEvent(new Event('fechou:unauthorized'))

    expect(await screen.findByText('rota de login')).not.toBeNull()
    expect(screen.queryByText('conteúdo privado')).toBeNull()
  })

  it.each([
    ['erro 5xx', { response: { status: 503 } }, 'serviço de autenticação está indisponível'],
    ['falha de rede', new Error('network'), 'Não foi possível conectar para validar sua sessão'],
  ])('não redireciona nem libera dados privados após %s e permite nova validação', async (_label, error, message) => {
    authService.getCurrentUser.mockRejectedValueOnce(error).mockResolvedValueOnce(providerUser)
    renderProtectedRoute()

    expect((await screen.findByRole('alert')).textContent).toContain(message)
    expect(screen.queryByText('conteúdo privado')).toBeNull()
    expect(screen.queryByText('rota de login')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('conteúdo privado')).not.toBeNull()
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(2)
  })
})
