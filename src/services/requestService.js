import serviceCategories from '../data/serviceCategories.js'
import api from './api.js'

const validCategoryIds = new Set(serviceCategories.map(({ id }) => id))

function normalizeDetails(details) {
  const categoryId = String(details.categoryId ?? '')
  if (!validCategoryIds.has(categoryId)) throw new Error('Selecione uma categoria válida.')
  const amount = (value) => {
    const normalized = String(value ?? '').trim()
    return normalized ? Number(normalized) : null
  }
  return {
    title: String(details.title ?? '').trim(),
    categoryId,
    description: String(details.description ?? '').trim(),
    city: String(details.city ?? '').trim(),
    region: String(details.region ?? '').trim(),
    neighborhood: String(details.neighborhood ?? '').trim() || null,
    desiredDate: String(details.desiredDate ?? '').trim() || null,
    availability: String(details.availability ?? '').trim() || null,
    budgetMin: details.prefersProposals ? null : amount(details.budgetMin),
    budgetMax: details.prefersProposals ? null : amount(details.budgetMax),
    prefersProposals: Boolean(details.prefersProposals),
  }
}

async function listByUser() {
  const { data } = await api.get('/requests')
  return data.data
}

async function getById(_ownerId, requestId) {
  try {
    const { data } = await api.get(`/requests/${encodeURIComponent(requestId)}`)
    return data.request
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

async function getAnyById(requestId) {
  return getById(null, requestId)
}

async function listOpen() {
  const { data } = await api.get('/requests/open')
  return data.data
}

async function create(_ownerId, details) {
  const { data } = await api.post('/requests', normalizeDetails(details))
  return data.request
}

async function update(_ownerId, requestId, details) {
  const { data } = await api.patch(`/requests/${encodeURIComponent(requestId)}`, normalizeDetails(details))
  return data.request
}

async function cancel(_ownerId, requestId) {
  const { data } = await api.post(`/requests/${encodeURIComponent(requestId)}/cancel`)
  return data.request
}

const requestService = { cancel, create, getAnyById, getById, listByUser, listOpen, update }
export default requestService
