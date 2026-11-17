import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

vi.mock('./api.js', () => ({ default: apiMocks }))

import authService from './authService.js'
import conversationService from './conversationService.js'
import { getMyProviderProfile, getProviderById, getProviders, saveProviderAd } from './providerService.js'
import requestService from './requestService.js'
import quoteService from './quoteService.js'
import serviceOrderService from './serviceOrderService.js'

const user = { id: 'user-test-1', name: 'Pessoa de Teste', role: 'customer' }

const requestDetails = {
  title: 'Troca de tomada',
  categoryId: 'eletrica',
  description: 'Preciso trocar uma tomada da cozinha.',
  city: 'Curitiba',
  region: 'PR',
  neighborhood: 'Centro',
  desiredDate: '',
  availability: '',
  budgetMin: '50',
  budgetMax: '150',
  prefersProposals: false,
}

describe('contratos HTTP dos serviços', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
  })

  it('cadastra e autentica sem enviar um token antigo', async () => {
    const details = { name: 'Pessoa de Teste', email: 'teste@example.invalid', password: 'senha-de-teste', role: 'customer' }
    apiMocks.post.mockResolvedValueOnce({ data: { user, token: 'test-registration-token' } })
    await expect(authService.createAccount(details)).resolves.toEqual(user)
    expect(apiMocks.post).toHaveBeenNthCalledWith(1, '/auth/register', details, { skipAuth: true, skipAuthResetOn401: true })
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBe('test-registration-token')

    apiMocks.post.mockResolvedValueOnce({ data: { user, token: 'test-login-token' } })
    await expect(authService.signIn({ email: details.email, password: details.password })).resolves.toEqual(user)
    expect(apiMocks.post).toHaveBeenNthCalledWith(2, '/auth/login', { email: details.email, password: details.password }, { skipAuth: true, skipAuthResetOn401: true })
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBe('test-login-token')
  })

  it('restaura sessão por /auth/me e conserva o token quando a resposta é 5xx', async () => {
    window.sessionStorage.setItem('fechou.auth.token', 'test-session-token')
    apiMocks.get.mockResolvedValueOnce({ data: { user } })
    await expect(authService.getCurrentUser()).resolves.toEqual(user)
    expect(apiMocks.get).toHaveBeenCalledWith('/auth/me')

    apiMocks.get.mockRejectedValueOnce({ response: { status: 503 } })
    await expect(authService.getCurrentUser()).rejects.toMatchObject({ response: { status: 503 } })
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBe('test-session-token')
  })

  it('trata 401 de /auth/me como sessão inválida e remove somente o token inválido', async () => {
    window.sessionStorage.setItem('fechou.auth.token', 'test-expired-token')
    apiMocks.get.mockRejectedValueOnce({ response: { status: 401 } })

    await expect(authService.getCurrentUser()).resolves.toBeNull()
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBeNull()
  })

  it('atualiza perfil pessoal e conclui logout local mesmo se a chamada falhar', async () => {
    apiMocks.patch.mockResolvedValueOnce({ data: { user: { ...user, name: 'Nome Atualizado' } } })
    await expect(authService.updateProfile({ name: 'Nome Atualizado', city: 'Curitiba', region: 'PR', bio: '' }))
      .resolves.toMatchObject({ name: 'Nome Atualizado' })
    expect(apiMocks.patch).toHaveBeenCalledWith('/profile', { name: 'Nome Atualizado', city: 'Curitiba', region: 'PR', bio: '' })

    window.sessionStorage.setItem('fechou.auth.token', 'test-session-token')
    apiMocks.post.mockRejectedValueOnce(new Error('offline'))
    await expect(authService.logout()).rejects.toThrow('offline')
    expect(apiMocks.post).toHaveBeenCalledWith('/auth/logout')
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBeNull()
  })

  it('consulta diretório e anúncio público com filtros e converte somente 404 em ausência', async () => {
    const provider = { id: 'provider-test-1', name: 'Profissional de Teste', services: [{ name: 'Instalação', priceFrom: '80' }] }
    apiMocks.get.mockResolvedValueOnce({ data: { data: [provider] } })
    const providers = await getProviders({ query: 'tomada', category: 'eletrica', neighborhood: 'Centro' })
    expect(providers).toMatchObject([{ id: provider.id, services: [{ priceFrom: 80 }] }])
    expect(Object.hasOwn(providers[0], 'active')).toBe(false)
    expect(apiMocks.get).toHaveBeenNthCalledWith(1, '/providers', {
      params: { q: 'tomada', category: 'eletrica', neighborhood: 'Centro' },
      skipAuth: true,
    })

    apiMocks.get.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(getProviderById(provider.id)).resolves.toBeNull()
    expect(apiMocks.get).toHaveBeenNthCalledWith(2, `/providers/${provider.id}`, { skipAuth: true })

    apiMocks.get.mockRejectedValueOnce({ response: { status: 503 } })
    await expect(getProviderById(provider.id)).rejects.toMatchObject({ response: { status: 503 } })
  })

  it('consulta o perfil próprio autenticado e distingue apenas 404 de recurso inexistente', async () => {
    const provider = { id: 'provider-test-1', active: 0, services: [] }
    apiMocks.get.mockResolvedValueOnce({ data: { provider } })
    await expect(getMyProviderProfile()).resolves.toMatchObject({ id: provider.id, active: false })
    expect(apiMocks.get).toHaveBeenCalledWith('/providers/me')

    apiMocks.get.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(getMyProviderProfile()).resolves.toBeNull()
    apiMocks.get.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(getMyProviderProfile()).rejects.toMatchObject({ response: { status: 403 } })
    apiMocks.get.mockRejectedValueOnce({ response: { status: 503 } })
    await expect(getMyProviderProfile()).rejects.toMatchObject({ response: { status: 503 } })
  })

  it('publica anúncio pelo endpoint autenticado e payload vigente', async () => {
    const provider = { id: 'provider-test-1', specialty: 'Eletricista', services: [] }
    apiMocks.put.mockResolvedValueOnce({ data: { provider } })
    await expect(saveProviderAd({
      specialty: 'Eletricista',
      summary: 'Instalações',
      categories: ['eletrica'],
      neighborhoods: ['Centro'],
      services: [{ name: 'Troca de tomada', priceFrom: 70 }],
    })).resolves.toMatchObject({ specialty: 'Eletricista' })
    expect(apiMocks.put).toHaveBeenCalledWith('/providers/me', {
      specialty: 'Eletricista',
      summary: 'Instalações',
      categories: ['eletrica'],
      neighborhoods: ['Centro'],
      services: [{ name: 'Troca de tomada', priceFrom: 70 }],
      active: true,
    })

    apiMocks.put.mockResolvedValueOnce({ data: { provider: { ...provider, active: 0 } } })
    await expect(saveProviderAd({
      specialty: 'Eletricista',
      summary: 'Perfil inativo',
      categories: ['eletrica'],
      neighborhoods: ['Centro'],
      services: [],
      active: false,
    })).resolves.toMatchObject({ active: false })
    expect(apiMocks.put).toHaveBeenLastCalledWith('/providers/me', {
      specialty: 'Eletricista',
      summary: 'Perfil inativo',
      categories: ['eletrica'],
      neighborhoods: ['Centro'],
      services: [],
      active: false,
    })
  })

  it('usa endpoints e payloads existentes para solicitações próprias', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { data: [] } })
    await expect(requestService.listByUser()).resolves.toEqual([])
    expect(apiMocks.get).toHaveBeenCalledWith('/requests')

    apiMocks.post.mockResolvedValueOnce({ data: { request: { id: 'request-test-1' } } })
    await expect(requestService.create('ignored-owner', requestDetails)).resolves.toEqual({ id: 'request-test-1' })
    expect(apiMocks.post).toHaveBeenCalledWith('/requests', {
      ...requestDetails,
      desiredDate: null,
      availability: null,
      budgetMin: 50,
      budgetMax: 150,
    })
  })

  it('usa os métodos HTTP existentes para consultar, editar e cancelar pedidos', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { request: { id: 'request-test-1' } } })
    await requestService.getById(user.id, 'request/test')
    expect(apiMocks.get).toHaveBeenCalledWith('/requests/request%2Ftest')

    apiMocks.patch.mockResolvedValueOnce({ data: { request: { id: 'request-test-1' } } })
    await requestService.update(user.id, 'request-test-1', requestDetails)
    expect(apiMocks.patch).toHaveBeenCalledWith('/requests/request-test-1', expect.objectContaining({ title: requestDetails.title }))

    apiMocks.post.mockResolvedValueOnce({ data: { request: { id: 'request-test-1', status: 'cancelled' } } })
    await requestService.cancel(user.id, 'request-test-1')
    expect(apiMocks.post).toHaveBeenCalledWith('/requests/request-test-1/cancel')
  })

  it('consulta, inicia/reutiliza conversa e envia mensagem pelos contratos atuais', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { data: [] } })
    await expect(conversationService.listByUser()).resolves.toEqual([])
    expect(apiMocks.get).toHaveBeenCalledWith('/conversations')

    apiMocks.post.mockResolvedValueOnce({ data: { conversation: { id: 'conversation-test-1' } } })
    await conversationService.createOrGet(user.id, 'request-test-1', 'provider-test-1')
    expect(apiMocks.post).toHaveBeenCalledWith('/conversations', { requestId: 'request-test-1', providerId: 'provider-test-1' })

    apiMocks.post.mockResolvedValueOnce({ data: { conversation: { id: 'conversation-test-1' } } })
    await conversationService.sendMessage(user.id, 'conversation-test-1', 'Olá, gostaria de conversar.')
    expect(apiMocks.post).toHaveBeenLastCalledWith('/conversations/conversation-test-1/messages', { text: 'Olá, gostaria de conversar.' })
  })

  it('consulta detalhe e marca leitura com a conversa identificada', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { conversation: { id: 'conversation-test-1' } } })
    await expect(conversationService.getForParticipant(user.id, 'conversation-test-1')).resolves.toEqual({ id: 'conversation-test-1' })
    expect(apiMocks.get).toHaveBeenCalledWith('/conversations/conversation-test-1')

    apiMocks.post.mockResolvedValueOnce({ data: { conversation: { id: 'conversation-test-1' } } })
    await conversationService.markReadForParticipant(user.id, 'conversation-test-1')
    expect(apiMocks.post).toHaveBeenCalledWith('/conversations/conversation-test-1/read')
  })

  it('envia e consulta alternativas/versionamento usando os contratos REST de orçamento', async () => {
    const version = { amountCents: 22500, description: 'Revisão de instalação e troca de componentes.', includedItems: ['Mão de obra'], excludedItems: [], estimatedDays: 2, conditions: 'Material adicional combinado antes.', validUntil: null }
    apiMocks.post.mockResolvedValueOnce({ data: { quote: { id: 'quote-test-1', title: 'Opção econômica' } } })
    await expect(quoteService.createForConversation('conversation-test-1', { title: 'Opção econômica', ...version }))
      .resolves.toEqual({ id: 'quote-test-1', title: 'Opção econômica' })
    expect(apiMocks.post).toHaveBeenCalledWith('/conversations/conversation-test-1/quotes', { title: 'Opção econômica', ...version })

    apiMocks.post.mockResolvedValueOnce({ data: { quote: { id: 'quote-test-1', currentVersionId: 'version-2' } } })
    await quoteService.revise('quote-test-1', version)
    expect(apiMocks.post).toHaveBeenLastCalledWith('/quotes/quote-test-1/versions', version)

    apiMocks.get.mockResolvedValueOnce({ data: { data: [{ id: 'quote-test-1' }] } })
    await expect(quoteService.listForRequest('request-test-1')).resolves.toEqual([{ id: 'quote-test-1' }])
    expect(apiMocks.get).toHaveBeenLastCalledWith('/requests/request-test-1/quotes')

    apiMocks.get.mockResolvedValueOnce({ data: { data: [{ id: 'version-1' }, { id: 'version-2' }] } })
    await expect(quoteService.listVersions('quote-test-1')).resolves.toHaveLength(2)
    expect(apiMocks.get).toHaveBeenLastCalledWith('/quotes/quote-test-1/versions')

    apiMocks.post.mockResolvedValueOnce({ data: { order: { id: 'order-test-1' }, created: true } })
    await expect(quoteService.acceptVersion('quote-test-1', 'version-2')).resolves.toMatchObject({ created: true })
    expect(apiMocks.post).toHaveBeenLastCalledWith('/quotes/quote-test-1/accept', { versionId: 'version-2' })
  })

  it('consulta ordens de serviço próprias e detalhes sem fabricar respostas', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { data: [{ id: 'order-test-1' }] } })
    await expect(serviceOrderService.list('request-test-1')).resolves.toEqual([{ id: 'order-test-1' }])
    expect(apiMocks.get).toHaveBeenCalledWith('/service-orders', { params: { requestId: 'request-test-1' } })

    apiMocks.get.mockResolvedValueOnce({ data: { order: { id: 'order-test-1', amountCents: 22500 } } })
    await expect(serviceOrderService.getById('order-test-1')).resolves.toMatchObject({ amountCents: 22500 })
    expect(apiMocks.get).toHaveBeenLastCalledWith('/service-orders/order-test-1')
  })
})
