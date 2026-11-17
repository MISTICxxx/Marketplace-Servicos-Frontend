import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import conversationService from '../services/conversationService.js'
import { getProviderById } from '../services/providerService.js'
import requestService from '../services/requestService.js'
import ConversationInboxPage from './ConversationInboxPage.jsx'

vi.mock('../auth/useAuth.js', () => ({ default: vi.fn() }))
vi.mock('../services/conversationService.js', () => ({
  default: {
    countUnread: vi.fn(),
    createOrGet: vi.fn(),
    listByUser: vi.fn(),
  },
}))
vi.mock('../services/providerService.js', () => ({ getProviderById: vi.fn() }))
vi.mock('../services/requestService.js', () => ({ default: { listByUser: vi.fn() } }))

const customer = { id: 'customer-test-id', role: 'customer' }
const provider = {
  id: 'provider-test-id',
  name: 'Joana Prestadora',
  specialty: 'Eletricista',
  categories: ['eletrica'],
}
const request = {
  id: 'request-test-id',
  title: 'Instalar luminária',
  categoryId: 'eletrica',
  status: 'open',
}

describe('ConversationInboxPage — iniciar conversa', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: customer })
    conversationService.listByUser.mockResolvedValue([])
    conversationService.createOrGet.mockResolvedValue({
      conversation: { id: 'conversation-test-id' },
      created: true,
    })
    getProviderById.mockResolvedValue(provider)
  })

  it('habilita abrir conversa quando os pedidos chegam após a primeira renderização', async () => {
    let resolveRequests
    requestService.listByUser.mockReturnValue(new Promise((resolve) => {
      resolveRequests = resolve
    }))

    render(
      <MemoryRouter initialEntries={['/conversas?prestador=provider-test-id']}>
        <ConversationInboxPage />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: 'Abrir conversa' })).toBeNull()
    resolveRequests([request])

    const openButton = await screen.findByRole('button', { name: 'Abrir conversa' })
    expect(openButton.disabled).toBe(false)

    fireEvent.click(openButton)
    await waitFor(() => {
      expect(conversationService.createOrGet).toHaveBeenCalledWith(
        customer.id,
        request.id,
        provider.id,
      )
    })
  })
})
