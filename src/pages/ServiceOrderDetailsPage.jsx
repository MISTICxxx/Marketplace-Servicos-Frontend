import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import Card from '../components/common/Card.jsx'
import { formatAmount } from '../utils/quoteFormatting.js'
import serviceOrderService from '../services/serviceOrderService.js'

function ServiceOrderDetailsPage() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, order: null, error: '' })
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    serviceOrderService.getById(orderId).then((order) => {
      if (active) setState({ loading: false, order, error: '' })
    }).catch((error) => {
      if (active) setState({ loading: false, order: null, error: error.response?.data?.error || error.message || 'Não foi possível carregar esta contratação.' })
    })
    return () => { active = false }
  }, [orderId, retry])

  if (state.loading) return <p className="page-container page-section" role="status">Carregando comprovante…</p>

  if (state.error || !state.order) {
    return (
      <section className="page-container page-section" aria-labelledby="order-error-title">
        <Card className="empty-state" role={state.error ? 'alert' : undefined}>
          <p className="eyebrow">Comprovante indisponível</p>
          <h1 id="order-error-title">Não foi possível abrir esta contratação.</h1>
          <p>{state.error || 'A ordem não existe ou não está disponível para esta conta.'}</p>
          <div className="quote-card-actions"><button className="button button--secondary" onClick={() => setRetry((value) => value + 1)} type="button">Tentar novamente</button><Link className="text-link" to="/contratacoes">Minhas contratações</Link></div>
        </Card>
      </section>
    )
  }

  const { order } = state
  const acceptedAt = new Date(order.acceptedAt)
  const formattedDate = Number.isNaN(acceptedAt.getTime()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(acceptedAt)

  return (
    <section className="page-container page-section service-order-details" aria-labelledby="service-order-title">
      <Link className="text-link" to="/contratacoes">← Voltar às contratações</Link>
      <Card className="service-order-receipt">
        <header className="service-order-heading">
          <div><p className="receipt-kicker">Fechou! · ordem de serviço</p><h1 id="service-order-title">{order.requestTitle}</h1><p>Contratação registrada em {formattedDate}</p></div>
          <span className="service-order-stamp">REGISTRADA</span>
        </header>
        <dl className="quote-facts">
          <div><dt>Cliente</dt><dd>{order.customerName}</dd></div>
          <div><dt>Prestador</dt><dd>{order.providerName}</dd></div>
          <div><dt>Orçamento</dt><dd>{order.quoteTitle}</dd></div>
          <div><dt>Versão aceita</dt><dd>{order.versionNumber}</dd></div>
          <div><dt>Valor registrado</dt><dd className="service-order-total">{formatAmount(order.amountCents)}</dd></div>
          <div><dt>Prazo estimado</dt><dd>{order.estimatedDays == null ? 'A combinar' : `${order.estimatedDays} dias`}</dd></div>
          <div><dt>Descrição do serviço</dt><dd>{order.description}</dd></div>
          <div><dt>Condições</dt><dd>{order.conditions}</dd></div>
        </dl>
        {order.includedItems?.length > 0 && <p className="quote-list"><strong>Itens incluídos:</strong> {order.includedItems.join(' · ')}</p>}
        {order.excludedItems?.length > 0 && <p className="quote-list"><strong>Itens não incluídos:</strong> {order.excludedItems.join(' · ')}</p>}
        <p className="service-order-payment-note" role="note">Esta ordem registra o aceite da proposta. O Fechou! não processou pagamento.</p>
        <p className="receipt-kicker">Solicitação: {order.requestId} · versão vinculada: {order.quoteVersionId}</p>
      </Card>
      <Link className="button button--secondary" to={user.role === 'provider' ? '/conversas' : `/meus-pedidos/${encodeURIComponent(order.requestId)}`}>Voltar ao atendimento</Link>
    </section>
  )
}

export default ServiceOrderDetailsPage
