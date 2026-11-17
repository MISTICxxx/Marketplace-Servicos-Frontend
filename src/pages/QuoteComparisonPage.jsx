import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import QuoteCard from '../components/quotes/QuoteCard.jsx'
import quoteService from '../services/quoteService.js'
import requestService from '../services/requestService.js'
import { formatRequestBudget, getCategoryName, statusLabels } from '../utils/requestFormatting.js'

function QuoteComparisonPage() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState({ status: 'loading', request: null, quotes: [], error: '' })
  const [retry, setRetry] = useState(0)
  const [selectedVersions, setSelectedVersions] = useState({})
  const [pending, setPending] = useState(null)
  const [accepting, setAccepting] = useState(false)
  const [actionError, setActionError] = useState('')
  const dialogRef = useRef(null)

  useEffect(() => {
    let active = true
    async function load() {
      setState({ status: 'loading', request: null, quotes: [], error: '' })
      try {
        const request = await requestService.getById(user.id, requestId)
        if (!request) throw new Error('Solicitação não encontrada ou indisponível para esta conta.')
        const quotes = await quoteService.listForRequest(requestId)
        const withVersions = await Promise.all(quotes.map(async (quote) => ({ ...quote, versions: await quoteService.listVersions(quote.id) })))
        if (active) {
          setState({ status: 'ready', request, quotes: withVersions, error: '' })
          setSelectedVersions(Object.fromEntries(withVersions.map((quote) => [quote.id, quote.currentVersionId])))
        }
      } catch (error) {
        if (active) setState({ status: 'error', request: null, quotes: [], error: error.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : error.response?.data?.error || error.message || 'Não foi possível carregar os orçamentos.' })
      }
    }
    void load()
    return () => { active = false }
  }, [requestId, retry, user.id])

  useEffect(() => {
    if (pending && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal()
    if (!pending && dialogRef.current?.open) dialogRef.current.close()
  }, [pending])

  function selectVersion(quoteId, versionId) {
    setSelectedVersions((current) => ({ ...current, [quoteId]: versionId }))
  }

  async function confirmAccept(event) {
    event.preventDefault()
    if (!pending || accepting) return
    setAccepting(true)
    setActionError('')
    try {
      const result = await quoteService.acceptVersion(pending.quote.id, pending.version.id)
      setPending(null)
      navigate(`/contratacoes/${encodeURIComponent(result.order.id)}`, { replace: true, state: { notice: 'Contratação registrada. Nenhum pagamento foi realizado.' } })
    } catch (error) {
      setActionError(error.response?.data?.error || (error.response?.status === 401
        ? 'Sua sessão expirou. Entre novamente para continuar.'
        : error.message || 'Não foi possível registrar a contratação. Atualize os orçamentos e tente novamente.'))
    } finally {
      setAccepting(false)
    }
  }

  if (state.status === 'loading') return <p className="page-container page-section" role="status">Carregando comparação de orçamentos…</p>

  if (state.status === 'error') {
    return (
      <section className="page-container page-section" aria-labelledby="quotes-error-title">
        <Card className="empty-state" role="alert">
          <p className="eyebrow">Orçamentos indisponíveis</p>
          <h1 id="quotes-error-title">Não foi possível carregar as propostas.</h1>
          <p>{state.error}</p>
          <div className="quote-card-actions">
            <Button onClick={() => setRetry((value) => value + 1)} variant="secondary">Tentar novamente</Button>
            <Link className="text-link" to="/meus-pedidos">Voltar aos pedidos</Link>
          </div>
        </Card>
      </section>
    )
  }

  const canAccept = state.request.status === 'open'
  return (
    <section className="page-container page-section quote-comparison-page" aria-labelledby="quote-comparison-title">
      <Link className="text-link" to={`/meus-pedidos/${encodeURIComponent(requestId)}`}>← Voltar para a solicitação</Link>
      <header className="page-heading quote-comparison-heading">
        <p className="eyebrow">Comparação de propostas</p>
        <h1 id="quote-comparison-title">{state.request.title}</h1>
        <p>{getCategoryName(state.request.categoryId)} · {state.request.city}/{state.request.region} · {statusLabels[state.request.status] ?? state.request.status}</p>
        <p className="quote-request-budget">Referência do pedido: {formatRequestBudget(state.request)}</p>
      </header>

      {state.quotes.length === 0 ? (
        <Card className="empty-state">
          <p className="eyebrow">Ainda sem propostas</p>
          <h2>Nenhum prestador enviou um orçamento.</h2>
          <p>As propostas recebidas aparecerão aqui com valor, escopo e prazo para você comparar.</p>
          <Link className="button button--secondary" to={`/meus-pedidos/${encodeURIComponent(requestId)}`}>Ver detalhes do pedido</Link>
        </Card>
      ) : (
        <>
          <div className="quote-comparison-grid">
            {state.quotes.map((quote) => {
              const selectedVersion = quote.versions.find((version) => version.id === selectedVersions[quote.id])
              const isCurrent = selectedVersion?.id === quote.currentVersionId
              return (
                <div className="quote-compare-column" key={quote.id}>
                  <QuoteCard quote={quote} versions={quote.versions} selectedVersionId={selectedVersions[quote.id]} onSelectVersion={selectVersion} />
                  {selectedVersion && !isCurrent && <p className="quote-old-version-note" role="status">Você está consultando uma versão anterior. Somente a versão vigente pode ser aceita.</p>}
                  <Button
                    disabled={!canAccept || quote.status !== 'active' || !isCurrent}
                    onClick={() => { setPending({ quote, version: selectedVersion }); setActionError('') }}
                  >
                    {quote.status === 'active' && isCurrent ? 'Revisar e aceitar esta versão' : 'Versão não disponível para aceite'}
                  </Button>
                </div>
              )
            })}
          </div>
          {!canAccept && <p className="form-message form-message--info" role="status">Esta solicitação não está aberta para uma nova contratação.</p>}
        </>
      )}

      <dialog aria-labelledby="quote-accept-title" className="quote-accept-dialog" ref={dialogRef} onCancel={() => setPending(null)}>
        {pending && (
          <form onSubmit={confirmAccept}>
            <p className="eyebrow">Confirmação de contratação</p>
            <h2 id="quote-accept-title">Confira a versão que será aceita</h2>
            <dl className="quote-facts quote-accept-facts">
              <div><dt>Prestador</dt><dd>{pending.quote.providerName}</dd></div>
              <div><dt>Alternativa</dt><dd>{pending.quote.title}</dd></div>
              <div><dt>Versão</dt><dd>{pending.version.versionNumber}</dd></div>
              <div><dt>Valor</dt><dd>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pending.version.amountCents / 100)}</dd></div>
              <div><dt>Escopo</dt><dd>{pending.version.description}</dd></div>
              <div><dt>Condições</dt><dd>{pending.version.conditions}</dd></div>
              <div><dt>Prazo</dt><dd>{pending.version.estimatedDays == null ? 'A combinar' : `${pending.version.estimatedDays} dias`}</dd></div>
            </dl>
            <p className="quote-helper">O aceite registra uma contratação. Nenhum pagamento é processado por esta demonstração.</p>
            {actionError && <p className="form-message form-message--error" role="alert">{actionError}</p>}
            <div className="quote-dialog-actions">
              <Button disabled={accepting} onClick={() => setPending(null)} type="button" variant="secondary">Voltar</Button>
              <Button disabled={accepting} type="submit">{accepting ? 'Registrando…' : 'Confirmar contratação'}</Button>
            </div>
          </form>
        )}
      </dialog>
    </section>
  )
}

export default QuoteComparisonPage
