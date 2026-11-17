import { useState } from 'react'
import Button from '../common/Button.jsx'
import { toCents } from '../../utils/quoteFormatting.js'

function fromCents(value) {
  if (!Number.isSafeInteger(Number(value))) return ''
  return `${Math.floor(Number(value) / 100)},${String(Number(value) % 100).padStart(2, '0')}`
}

function initialForm(quote) {
  const version = quote?.currentVersion
  return {
    title: quote?.title ?? '',
    amount: fromCents(version?.amountCents),
    description: version?.description ?? '',
    includedItems: version?.includedItems?.join('\n') ?? '',
    excludedItems: version?.excludedItems?.join('\n') ?? '',
    estimatedDays: version?.estimatedDays == null ? '' : String(version.estimatedDays),
    conditions: version?.conditions ?? '',
  }
}

function QuoteComposer({ conversationId, quote = null, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => initialForm(quote))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isRevision = Boolean(quote)

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const amountCents = toCents(values.amount)
    if (!amountCents) {
      setError('Informe um valor maior que zero, com até duas casas decimais.')
      return
    }
    const estimatedDays = values.estimatedDays.trim() ? Number(values.estimatedDays) : null
    if (estimatedDays !== null && (!Number.isInteger(estimatedDays) || estimatedDays < 1 || estimatedDays > 3650)) {
      setError('Informe um prazo em dias entre 1 e 3.650, ou deixe o campo vazio.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSubmit({
        ...(isRevision ? {} : { title: values.title.trim() }),
        amountCents,
        description: values.description.trim(),
        includedItems: values.includedItems.split('\n').map((item) => item.trim()).filter(Boolean),
        excludedItems: values.excludedItems.split('\n').map((item) => item.trim()).filter(Boolean),
        estimatedDays,
        conditions: values.conditions.trim(),
        validUntil: null,
      }, quote?.id, conversationId)
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível enviar o orçamento. Os dados foram mantidos para tentar novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="quote-composer" onSubmit={handleSubmit} aria-busy={saving}>
      <header className="quote-composer-heading">
        <div>
          <p className="eyebrow">{isRevision ? 'Nova versão' : 'Nova alternativa'}</p>
          <h3>{isRevision ? `Revisar ${quote.title}` : 'Preparar orçamento'}</h3>
        </div>
        {onCancel && <Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button>}
      </header>
      {!isRevision && (
        <label className="quote-field">Nome da alternativa
          <input autoComplete="off" maxLength="120" minLength="3" onChange={(event) => update('title', event.target.value)} required value={values.title} />
        </label>
      )}
      <label className="quote-field">Valor total (R$)
        <input autoComplete="off" inputMode="decimal" onChange={(event) => update('amount', event.target.value)} placeholder="Ex.: 250,00" required value={values.amount} />
      </label>
      <label className="quote-field">Descrição do serviço
        <textarea maxLength="5000" minLength="10" onChange={(event) => update('description', event.target.value)} required rows="3" value={values.description} />
      </label>
      <div className="quote-composer-columns">
        <label className="quote-field">Itens incluídos, um por linha
          <textarea maxLength="3000" onChange={(event) => update('includedItems', event.target.value)} rows="3" value={values.includedItems} />
        </label>
        <label className="quote-field">Itens não incluídos, um por linha
          <textarea maxLength="3000" onChange={(event) => update('excludedItems', event.target.value)} rows="3" value={values.excludedItems} />
        </label>
      </div>
      <label className="quote-field">Prazo estimado em dias
        <input inputMode="numeric" max="3650" min="1" onChange={(event) => update('estimatedDays', event.target.value)} type="number" value={values.estimatedDays} />
      </label>
      <label className="quote-field">Condições
        <textarea maxLength="5000" onChange={(event) => update('conditions', event.target.value)} required rows="3" value={values.conditions} />
      </label>
      {error && <p className="form-message form-message--error" role="alert">{error}</p>}
      <div className="quote-composer-actions">
        <Button disabled={saving} type="submit">{saving ? 'Salvando orçamento…' : isRevision ? 'Enviar nova versão' : 'Enviar orçamento'}</Button>
      </div>
      <p className="quote-helper">O valor e as condições ficam registrados em uma versão própria. O chat não confirma contratação.</p>
    </form>
  )
}

export default QuoteComposer
