import mockProviders from '../data/mockProviders.js'
import serviceCategories from '../data/serviceCategories.js'

const ignoredSearchWords = new Set(['a', 'as', 'de', 'do', 'da', 'das', 'dos', 'e', 'em', 'minha', 'meu', 'minhas', 'meus', 'o', 'os', 'para', 'por', 'um', 'uma', 'uns', 'umas'])

/** Normaliza espaços, caixa e diacríticos para pesquisas em português. */
export function normalizeSearchText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ')
}

function getSearchableText(provider) {
  const categoryNames = provider.categories
    .map((categoryId) => serviceCategories.find((category) => category.id === categoryId)?.name ?? '')
  const serviceNames = provider.services.map((service) => service.name)

  return normalizeSearchText([
    provider.name,
    provider.specialty,
    provider.summary,
    provider.bio,
    ...categoryNames,
    ...serviceNames,
    ...provider.neighborhoods,
  ].join(' '))
}

/** Lista prestadores locais com busca textual e filtros combináveis. */
export function getProviders({ query = '', category = '', neighborhood = '' } = {}) {
  const searchTerms = normalizeSearchText(query)
    .split(' ')
    .filter((word) => word.length > 1 && !ignoredSearchWords.has(word))

  return mockProviders.filter((provider) => {
    const matchesCategory = !category || provider.categories.includes(category)
    const matchesNeighborhood = !neighborhood || provider.neighborhoods.includes(neighborhood)
    const searchableText = searchTerms.length ? getSearchableText(provider) : ''
    const matchesQuery = searchTerms.every((word) => searchableText.includes(word))

    return matchesCategory && matchesNeighborhood && matchesQuery
  })
}

/** Busca um prestador pelo identificador estável usado nas rotas. */
export function getProviderById(providerId) {
  return mockProviders.find((provider) => provider.id === providerId)
}

/** Devolve bairros presentes nos registros locais, em ordem alfabética. */
export function getNeighborhoodOptions() {
  return [...new Set(mockProviders.flatMap((provider) => provider.neighborhoods))]
    .sort((first, second) => first.localeCompare(second, 'pt-BR'))
}

export function getServiceCategories() {
  return serviceCategories
}
