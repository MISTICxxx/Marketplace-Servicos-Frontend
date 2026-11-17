import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import quoteService from '../services/quoteService.js'
import requestService from '../services/requestService.js'
import QuoteComparisonPage from './QuoteComparisonPage.jsx'

vi.mock('../auth/useAuth.js', () => ({ default: vi.fn() }))
vi.mock('../services/quoteService.js', () => ({ default: {
  acceptVersion: vi.fn(),
  listForRequest: vi.fn(),
  listVersions: vi.fn(),
} }))
vi.mock('../services/requestService.js', () => ({ default: { getById: vi.fn() } }))

const request = { id: 'request-1', title: 'Revisar tomadas', status: 'open', categoryId: 'eletrica', city: 'Curitiba', region: 'PR', budgetMin: null, budgetMax: null, prefersProposals: true }
const quote = { id: 'quote-1', title: 'Opção essencial', providerId: 'provider-1', providerName: 'Rafa Eletricidade', status: 'active', currentVersionId: 'version-2', currentVersion: { id: 'version-2', versionNumber: 2, amountCents: 20500, description: 'Revisão de tomadas e teste de segurança.', includedItems: ['Mão de obra'], excludedItems: [], estimatedDays: 2, conditions: 'Material adicional combinado antes.' } }
const versions = [
  { id: 'version-1', versionNumber: 1, amountCents: 18500, description: 'Revisão inicial do circuito.' },
  quote.currentVersion,
]

function renderComparison() {
  return render(
    <MemoryRouter initialEntries={['/meus-pedidos/request-1/orcamentos']}>
      <Routes>
        <Route element={<QuoteComparisonPage />} path="/meus-pedidos/:requestId/orcamentos" />
        <Route element={<p>Ordem de serviço aberta</p>} path="/contratacoes/:orderId" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('QuoteComparisonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', '') } })
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open') } })
    useAuth.mockReturnValue({ user: { id: 'customer-1', role: 'customer' } })
    requestService.getById.mockResolvedValue(request)
    quoteService.listForRequest.mockResolvedValue([quote])
    quoteService.listVersions.mockResolvedValue(versions)
    quoteService.acceptVersion.mockResolvedValue({ created: true, order: { id: 'order-1' } })
  })

  it('permite consultar versões anteriores, mas só habilita o aceite da versão vigente', async () => {
    renderComparison()
    expect(await screen.findByRole('heading', { name: 'Revisar tomadas' })).toBeTruthy()
    const accept = await screen.findByRole('button', { name: 'Revisar e aceitar esta versão' })
    expect(accept.disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: /Versão 1/ }))
    expect(await screen.findByRole('status')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Versão não disponível para aceite' }).disabled).toBe(true)
  })

  it('exige confirmação explícita e envia o identificador da versão exata ao backend', async () => {
    renderComparison()
    fireEvent.click(await screen.findByRole('button', { name: 'Revisar e aceitar esta versão' }))
    expect(screen.getByRole('dialog').textContent).toContain('205,00')
    expect(quoteService.acceptVersion).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar contratação' }))
    await waitFor(() => expect(quoteService.acceptVersion).toHaveBeenCalledWith('quote-1', 'version-2'))
    expect(await screen.findByText('Ordem de serviço aberta')).toBeTruthy()
  })
})
