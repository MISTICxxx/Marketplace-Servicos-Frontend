import serviceCategories from '../data/serviceCategories.js'
import api from './api.js'

function normalizeProvider(provider) {
  return {
    ...provider,
    ...(provider.active === undefined ? {} : {
      active: provider.active === true || provider.active === 1 || provider.active === '1',
    }),
    bio: provider.bio || provider.summary || '',
    services: (provider.services || []).map((service) => ({ ...service, priceFrom: Number(service.priceFrom) || 0 })),
    isCustom: true,
  }
}

export async function getProviders({ query = '', category = '', neighborhood = '' } = {}) {
  const { data } = await api.get('/providers', { params: { q: query, category, neighborhood }, skipAuth: true })
  return data.data.map(normalizeProvider)
}

export async function getProviderById(providerId) {
  try {
    const { data } = await api.get(`/providers/${encodeURIComponent(providerId)}`, { skipAuth: true })
    return normalizeProvider(data.provider)
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

export async function getMyProviderProfile() {
  try {
    const { data } = await api.get('/providers/me')
    return normalizeProvider(data.provider)
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

export async function getNeighborhoodOptions() {
  const providers = await getProviders()
  return [...new Set(providers.flatMap((provider) => provider.neighborhoods || []))]
    .sort((first, second) => first.localeCompare(second, 'pt-BR'))
}

export function getServiceCategories() {
  return serviceCategories
}

export async function saveProviderAd(ad) {
  const { data } = await api.put('/providers/me', {
    specialty: ad.specialty,
    summary: ad.summary,
    categories: ad.categories,
    neighborhoods: ad.neighborhoods,
    services: ad.services,
    active: typeof ad.active === 'boolean' ? ad.active : true,
  })
  return normalizeProvider(data.provider)
}
