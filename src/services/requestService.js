import serviceCategories from '../data/serviceCategories.js'

const REQUESTS_KEY = 'fechou.demo.requests.v1'
const validCategoryIds = new Set(serviceCategories.map(({ id }) => id))

function createId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `pedido-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function nextTimestamp(previousValue) {
  const previousTime = Date.parse(previousValue)
  return new Date(Math.max(Date.now(), Number.isFinite(previousTime) ? previousTime + 1 : Date.now())).toISOString()
}

function readRequests() {
  const savedRequests = window.localStorage.getItem(REQUESTS_KEY)
  if (!savedRequests) return []

  try {
    const requests = JSON.parse(savedRequests)
    if (!Array.isArray(requests)) throw new Error('Formato inválido')
    return requests.filter((request) => (
      request
      && typeof request.id === 'string'
      && typeof request.ownerId === 'string'
      && Array.isArray(request.history)
    ))
  } catch {
    throw new Error('Não foi possível ler os pedidos salvos neste navegador. Os dados não foram alterados.')
  }
}

function saveRequests(requests) {
  try {
    window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
  } catch {
    throw new Error('Não foi possível salvar o pedido neste navegador. Verifique o espaço disponível e tente novamente.')
  }
}

function requireOwnerId(ownerId) {
  if (typeof ownerId !== 'string' || !ownerId.trim()) {
    throw new Error('Entre na sua conta para continuar.')
  }
  return ownerId
}

function normalizeDetails(details) {
  const categoryId = String(details.categoryId ?? '')
  if (!validCategoryIds.has(categoryId)) throw new Error('Selecione uma categoria válida.')

  const optionalText = (value) => String(value ?? '').trim() || null
  const optionalAmount = (value) => {
    const normalized = String(value ?? '').trim()
    return normalized ? Number(normalized) : null
  }

  return {
    title: String(details.title ?? '').trim(),
    categoryId,
    description: String(details.description ?? '').trim(),
    city: String(details.city ?? '').trim(),
    region: String(details.region ?? '').trim(),
    neighborhood: optionalText(details.neighborhood),
    desiredDate: optionalText(details.desiredDate),
    availability: optionalText(details.availability),
    budgetMin: details.prefersProposals ? null : optionalAmount(details.budgetMin),
    budgetMax: details.prefersProposals ? null : optionalAmount(details.budgetMax),
    prefersProposals: Boolean(details.prefersProposals),
  }
}

function addHistory(request, event, description, createdAt = new Date().toISOString()) {
  return {
    ...request,
    history: [...request.history, { id: createId(), event, description, createdAt }],
  }
}

function listByUser(ownerId) {
  const currentOwnerId = requireOwnerId(ownerId)
  return readRequests()
    .filter((request) => request.ownerId === currentOwnerId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

function getById(ownerId, requestId) {
  const currentOwnerId = requireOwnerId(ownerId)
  return readRequests().find((request) => (
    request.id === requestId && request.ownerId === currentOwnerId
  )) ?? null
}

function create(ownerId, details) {
  const currentOwnerId = requireOwnerId(ownerId)
  const now = new Date().toISOString()
  const request = {
    id: createId(),
    ownerId: currentOwnerId,
    ...normalizeDetails(details),
    status: 'open',
    createdAt: now,
    updatedAt: now,
    history: [{ id: createId(), event: 'created', description: 'Pedido registrado neste navegador.', createdAt: now }],
  }
  saveRequests([...readRequests(), request])
  return request
}

function update(ownerId, requestId, details) {
  const currentOwnerId = requireOwnerId(ownerId)
  const requests = readRequests()
  const index = requests.findIndex((request) => request.id === requestId && request.ownerId === currentOwnerId)
  if (index < 0) throw new Error('Solicitação não encontrada.')

  const current = requests[index]
  if (current.status !== 'open') throw new Error('Somente solicitações abertas podem ser editadas.')

  const updatedAt = nextTimestamp(current.updatedAt)
  const updated = addHistory({
    ...current,
    ...normalizeDetails(details),
    updatedAt,
  }, 'edited', 'Dados do pedido atualizados neste navegador.', updatedAt)
  requests[index] = updated
  saveRequests(requests)
  return updated
}

function cancel(ownerId, requestId) {
  const currentOwnerId = requireOwnerId(ownerId)
  const requests = readRequests()
  const index = requests.findIndex((request) => request.id === requestId && request.ownerId === currentOwnerId)
  if (index < 0) throw new Error('Solicitação não encontrada.')

  const current = requests[index]
  if (current.status !== 'open') throw new Error('Esta solicitação já está cancelada.')

  const updatedAt = nextTimestamp(current.updatedAt)
  const cancelled = addHistory({
    ...current,
    status: 'cancelled',
    updatedAt,
  }, 'cancelled', 'Solicitação cancelada pela pessoa responsável.', updatedAt)
  requests[index] = cancelled
  saveRequests(requests)
  return cancelled
}

const requestService = { cancel, create, getById, listByUser, update }

export { REQUESTS_KEY }
export default requestService
