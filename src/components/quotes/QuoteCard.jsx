import { formatAmount, quoteStatusLabels } from '../../utils/quoteFormatting.js'

function QuoteCard({ quote, versions = [], selectedVersionId, onSelectVersion, onRevise, onWithdraw, providerActions = false }) {
  const current = quote.currentVersion
  if (!current) return null

  return (
    <article className="quote-card">
      <header className="quote-card-heading">
        <div>
          <p className="receipt-kicker">Alternativa independente</p>
          <h3>{quote.title}</h3>
          <p className="quote-provider-name">{quote.providerName}</p>
        </div>
        <span className={`quote-status quote-status--${quote.status}`}>{quoteStatusLabels[quote.status] ?? quote.status}</span>
      </header>
      <div className="quote-current-summary">
        <p className="quote-version-label">Versão {current.versionNumber} · vigente</p>
        <strong className="quote-amount">{formatAmount(current.amountCents)}</strong>
        <p>{current.description}</p>
      </div>
      <dl className="quote-facts">
        <div><dt>Prazo estimado</dt><dd>{current.estimatedDays == null ? 'A combinar' : `${current.estimatedDays} ${current.estimatedDays === 1 ? 'dia' : 'dias'}`}</dd></div>
        <div><dt>Condições</dt><dd>{current.conditions}</dd></div>
      </dl>
      {current.includedItems?.length > 0 && <p className="quote-list"><strong>Inclui:</strong> {current.includedItems.join(' · ')}</p>}
      {current.excludedItems?.length > 0 && <p className="quote-list"><strong>Não inclui:</strong> {current.excludedItems.join(' · ')}</p>}
      {versions.length > 1 && (
        <details className="quote-history">
          <summary>Histórico de versões ({versions.length})</summary>
          <ol>
            {versions.map((version) => (
              <li key={version.id}>
                <button
                  aria-pressed={selectedVersionId === version.id}
                  className="quote-history-choice"
                  onClick={() => onSelectVersion?.(quote.id, version.id)}
                  type="button"
                >
                  <span>Versão {version.versionNumber}{version.id === current.id ? ' · vigente' : ' · anterior'}</span>
                  <strong>{formatAmount(version.amountCents)}</strong>
                </button>
                <p>{version.description}</p>
              </li>
            ))}
          </ol>
        </details>
      )}
      {providerActions && quote.status === 'active' && (
        <div className="quote-card-actions">
          <button className="text-link" onClick={() => onRevise?.(quote)} type="button">Criar nova versão</button>
          <button className="text-link" onClick={() => onWithdraw?.(quote)} type="button">Retirar orçamento</button>
        </div>
      )}
    </article>
  )
}

export default QuoteCard
