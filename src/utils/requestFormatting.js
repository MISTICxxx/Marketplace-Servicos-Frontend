import serviceCategories from '../data/serviceCategories.js'

const statusLabels = { open: 'Aberto', cancelled: 'Cancelado' }

function getCategoryName(categoryId) {
  return serviceCategories.find(({ id }) => id === categoryId)?.name ?? 'Categoria indisponível'
}

function formatRequestDate(value, includeTime = false) {
  if (!value) return 'Não informada'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data indisponível'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' } : {}),
  }).format(date)
}

function formatDesiredDate(value) {
  if (!value) return 'Sem data definida'
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return 'Data indisponível'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(year, month - 1, day, 12))
}

function formatRequestBudget(request) {
  if (request.prefersProposals) return 'Prefere receber propostas'
  const currency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  if (request.budgetMin === null && request.budgetMax === null) return 'Sem orçamento informado'
  if (request.budgetMin !== null && request.budgetMax !== null) return `${currency(request.budgetMin)} a ${currency(request.budgetMax)}`
  if (request.budgetMin !== null) return `A partir de ${currency(request.budgetMin)}`
  return `Até ${currency(request.budgetMax)}`
}

export { formatDesiredDate, formatRequestBudget, formatRequestDate, getCategoryName, statusLabels }
