function toCents(value) {
  const normalized = String(value).trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const [reais, cents = ''] = normalized.split('.')
  const total = BigInt(reais) * 100n + BigInt(cents.padEnd(2, '0'))
  return total > 0n && total <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(total) : null
}

function formatAmount(amountCents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountCents / 100)
}

const quoteStatusLabels = {
  active: 'Disponível',
  withdrawn: 'Retirado',
  accepted: 'Aceito',
  closed: 'Encerrado',
}

export { formatAmount, quoteStatusLabels, toCents }
