import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home.jsx'
import { getProviders } from '../services/providerService.js'

vi.mock('../services/providerService.js', () => ({ getProviders: vi.fn() }))
vi.mock('../components/ProviderCard.jsx', () => ({
  default: ({ provider }) => <article>{provider.name}</article>,
}))

const provider = { id: 'provider-1', name: 'Ana Ferreira' }

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

describe('Home — prestadores em destaque', () => {
  beforeEach(() => vi.clearAllMocks())

  it('informa o carregamento e depois exibe os prestadores retornados', async () => {
    let resolveRequest
    getProviders.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))

    renderHome()
    expect(screen.getByRole('status').textContent).toContain('Carregando prestadores em destaque')

    await act(async () => resolveRequest([provider]))
    expect(screen.getByText('Ana Ferreira')).not.toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('distingue uma resposta vazia de uma falha da API', async () => {
    getProviders.mockResolvedValueOnce([])

    renderHome()

    expect((await screen.findByText('Ainda não há prestadores disponíveis para destacar.')).textContent)
      .toContain('Ainda não há prestadores disponíveis')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByText('Ana Ferreira')).toBeNull()
  })

  it.each([
    ['falha de rede', new Error('mensagem interna que não deve aparecer')],
    ['erro 5xx', { response: { status: 503, data: { error: 'detalhe interno' } } }],
  ])('apresenta falha recuperável em caso de %s sem inventar resultados', async (_label, error) => {
    getProviders.mockRejectedValueOnce(error)

    renderHome()

    expect((await screen.findByRole('alert')).textContent).toContain('Não foi possível carregar os prestadores')
    expect(screen.queryByText('mensagem interna que não deve aparecer')).toBeNull()
    expect(screen.queryByText('detalhe interno')).toBeNull()
    expect(screen.queryByText('Ainda não há prestadores disponíveis')).toBeNull()
    expect(getProviders).toHaveBeenCalledTimes(1)
  })

  it('repete a consulta somente quando a pessoa solicita e recupera o estado', async () => {
    getProviders.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([provider])
    renderHome()
    await screen.findByRole('alert')

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Ana Ferreira')).not.toBeNull()
    expect(getProviders).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
