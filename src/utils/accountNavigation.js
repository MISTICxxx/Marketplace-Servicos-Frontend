const allowedDestinations = new Set([
  '/',
  '/servicos',
  '/sobre',
  '/diagnostico-api',
  '/minha-conta',
  '/solicitar-servico',
  '/meus-pedidos',
  '/conversas',
])

/** Aceita apenas destinos internos conhecidos ao retornar de uma tela de acesso. */
function getAccountReturnPath(from) {
  const pathname = from?.pathname
  const isProviderProfile = /^\/prestadores\/[a-z0-9-]+$/i.test(pathname ?? '')
  const isRequestDetails = /^\/meus-pedidos\/[a-z0-9-]+$/i.test(pathname ?? '')
  const isConversationDetails = /^\/conversas\/[a-z0-9-]+$/i.test(pathname ?? '')
  if (!allowedDestinations.has(pathname) && !isProviderProfile && !isRequestDetails && !isConversationDetails) return '/minha-conta'

  const search = typeof from.search === 'string' && from.search.startsWith('?') ? from.search : ''
  const hash = typeof from.hash === 'string' && from.hash.startsWith('#') ? from.hash : ''
  return `${pathname}${search}${hash}`
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toLocaleUpperCase('pt-BR') || 'F'
}

export { getAccountReturnPath, getInitials }
