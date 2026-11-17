import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import api from '../../src/services/api.js'
import authService from '../../src/services/authService.js'
import conversationService from '../../src/services/conversationService.js'
import { getMyProviderProfile, getProviderById, getProviders, saveProviderAd } from '../../src/services/providerService.js'
import requestService from '../../src/services/requestService.js'
import quoteService from '../../src/services/quoteService.js'
import serviceOrderService from '../../src/services/serviceOrderService.js'

function getSafeApiBaseUrl() {
  const rawUrl = process.env.FECHOU_FRONTEND_TEST_API_URL
  if (!rawUrl) {
    throw new Error('Integração bloqueada: defina FECHOU_FRONTEND_TEST_API_URL com a URL explícita da API descartável.')
  }

  let url
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('Integração bloqueada: FECHOU_FRONTEND_TEST_API_URL não é uma URL válida.')
  }

  const port = Number(url.port)
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1'
    || !Number.isInteger(port) || port < 20000 || port > 59999
    || url.pathname.replace(/\/$/, '') !== '/api' || url.search || url.hash) {
    throw new Error('Integração bloqueada: use somente http://127.0.0.1:<porta-de-teste>/api.')
  }

  return url.toString().replace(/\/$/, '')
}

describe('serviços do frontend contra a API descartável', () => {
  beforeAll(async () => {
    api.defaults.baseURL = getSafeApiBaseUrl()
    const health = await api.get('/health', { skipAuth: true })
    expect(health.status).toBe(200)
    expect(health.data).toMatchObject({ status: 'ok', service: 'fechou-api' })
  })

  afterAll(() => window.sessionStorage.clear())

  it('registra perfil, cria pedido, conversa e mantém as mensagens entre contas', async () => {
    const unique = randomUUID()
    const password = `Frontend-test-${unique}`
    const providerEmail = `provider-${unique}@example.invalid`
    const customerEmail = `customer-${unique}@example.invalid`

    const provider = await authService.createAccount({
      name: 'Prestadora de Teste', email: providerEmail, password, role: 'provider',
    })
    expect(provider).toMatchObject({ email: providerEmail, role: 'provider' })
    expect(await getProviderById(provider.id)).toBeNull()
    expect(await getMyProviderProfile()).toMatchObject({ id: provider.id, active: false })

    const ad = {
      specialty: 'Eletricista',
      summary: 'Instalações residenciais',
      categories: ['eletrica'],
      neighborhoods: ['Centro'],
      services: [{ name: 'Instalar luminária', priceFrom: 95 }],
    }
    await saveProviderAd(ad)
    await authService.updateProfile({
      name: provider.name, city: 'Curitiba', region: 'PR', bio: 'Atendo instalações residenciais.',
    })

    expect(await getMyProviderProfile()).toMatchObject({
      id: provider.id, active: true, specialty: 'Eletricista', summary: 'Instalações residenciais',
    })

    const results = await getProviders({ query: 'Eletricista', category: 'eletrica', neighborhood: 'Centro' })
    expect(results.some((result) => result.id === provider.id)).toBe(true)
    expect(await getProviderById(provider.id)).toMatchObject({ specialty: 'Eletricista', neighborhoods: ['Centro'] })

    const inactive = await saveProviderAd({ ...ad, summary: 'Perfil editado enquanto inativo.', active: false })
    expect(inactive).toMatchObject({ active: false, summary: 'Perfil editado enquanto inativo.' })
    expect(await getMyProviderProfile()).toMatchObject({ active: false, summary: 'Perfil editado enquanto inativo.' })
    expect(await getProviderById(provider.id)).toBeNull()
    expect((await getProviders()).some((result) => result.id === provider.id)).toBe(false)

    await saveProviderAd({ ...ad, summary: 'Perfil reativado pelo contrato existente.' })
    expect(await getMyProviderProfile()).toMatchObject({ active: true, summary: 'Perfil reativado pelo contrato existente.' })
    expect(await getProviderById(provider.id)).toMatchObject({ summary: 'Perfil reativado pelo contrato existente.' })

    const customer = await authService.createAccount({
      name: 'Cliente de Teste', email: customerEmail, password, role: 'customer',
    })
    const request = await requestService.create(customer.id, {
      title: 'Instalação de luminária',
      categoryId: 'eletrica',
      description: 'Preciso instalar uma luminária na sala.',
      city: 'Curitiba',
      region: 'PR',
      neighborhood: 'Centro',
      desiredDate: '',
      availability: 'Período da tarde',
      budgetMin: '',
      budgetMax: '',
      prefersProposals: true,
    })
    expect(request).toMatchObject({ title: 'Instalação de luminária', status: 'open' })
    expect((await requestService.listByUser()).some((item) => item.id === request.id)).toBe(true)

    const firstConversation = await conversationService.createOrGet(customer.id, request.id, provider.id)
    const reusedConversation = await conversationService.createOrGet(customer.id, request.id, provider.id)
    expect(firstConversation.created).toBe(true)
    expect(reusedConversation.created).toBe(false)
    expect(reusedConversation.conversation.id).toBe(firstConversation.conversation.id)

    const customerMessage = await conversationService.sendMessage(
      customer.id, firstConversation.conversation.id, 'Olá, consegue instalar esta semana?',
    )
    expect(customerMessage.messages.some((message) => message.text === 'Olá, consegue instalar esta semana?')).toBe(true)

    await authService.signIn({ email: providerEmail, password })
    expect((await conversationService.listByProvider()).some((item) => item.id === firstConversation.conversation.id)).toBe(true)
    await conversationService.markReadForParticipant(provider.id, firstConversation.conversation.id)
    const providerReply = await conversationService.sendMessage(
      provider.id, firstConversation.conversation.id, 'Sim, tenho horário na quinta-feira.',
    )
    expect(providerReply.messages.some((message) => message.text === 'Sim, tenho horário na quinta-feira.')).toBe(true)

    const baseQuote = {
      amountCents: 21500,
      description: 'Instalação da luminária e teste do ponto elétrico existente.',
      includedItems: ['Mão de obra', 'Teste de funcionamento'],
      excludedItems: ['Luminária'],
      estimatedDays: 1,
      conditions: 'O acesso ao ponto precisa estar liberado.',
      validUntil: null,
    }
    const initialQuote = await quoteService.createForConversation(firstConversation.conversation.id, {
      title: 'Instalação essencial', ...baseQuote,
    })
    expect(initialQuote.currentVersion).toMatchObject({ amountCents: 21500, versionNumber: 1 })
    const revisedQuote = await quoteService.revise(initialQuote.id, {
      ...baseQuote,
      amountCents: 23500,
      description: 'Instalação com substituição de conector e teste do ponto elétrico.',
    })
    expect(revisedQuote.currentVersion).toMatchObject({ amountCents: 23500, versionNumber: 2 })
    const alternative = await quoteService.createForConversation(firstConversation.conversation.id, {
      title: 'Instalação com acabamento', ...baseQuote, amountCents: 29000,
    })
    expect(alternative.id).not.toBe(initialQuote.id)

    await authService.signIn({ email: customerEmail, password })
    const persisted = await conversationService.getForParticipant(customer.id, firstConversation.conversation.id)
    expect(persisted.messages.map((message) => message.text)).toEqual([
      'Olá, consegue instalar esta semana?',
      'Sim, tenho horário na quinta-feira.',
    ])

    const comparableQuotes = await quoteService.listForRequest(request.id)
    expect(comparableQuotes).toHaveLength(2)
    expect(comparableQuotes.map((quote) => quote.id)).toEqual(expect.arrayContaining([initialQuote.id, alternative.id]))
    const storedVersions = await quoteService.listVersions(initialQuote.id)
    expect(storedVersions.map((version) => version.amountCents)).toEqual([21500, 23500])
    const accepted = await quoteService.acceptVersion(initialQuote.id, revisedQuote.currentVersion.id)
    expect(accepted).toMatchObject({ created: true, order: { quoteId: initialQuote.id, quoteVersionId: revisedQuote.currentVersion.id, amountCents: 23500 } })
    const orders = await serviceOrderService.list(request.id)
    expect(orders).toHaveLength(1)
    expect(orders[0].quoteVersionId).toBe(revisedQuote.currentVersion.id)
    await expect(serviceOrderService.getById(orders[0].id)).resolves.toMatchObject({ status: 'contracted', amountCents: 23500 })
    expect(await authService.getCurrentUser()).toMatchObject({ id: customer.id, role: 'customer' })

    const contractedMessage = await conversationService.sendMessage(customer.id, firstConversation.conversation.id, 'Recebi o registro e podemos combinar a visita.')
    expect(contractedMessage.messages.at(-1).text).toBe('Recebi o registro e podemos combinar a visita.')
  })
})
