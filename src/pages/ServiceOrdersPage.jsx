import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import Card from '../components/common/Card.jsx'
import { formatAmount } from '../utils/quoteFormatting.js'
import serviceOrderService from '../services/serviceOrderService.js'

function ServiceOrdersPage() {
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, orders: [], error: '' })
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    serviceOrderService.list().then((orders) => {
      if (active) setState({ loading: false, orders, error: '' })
    }).catch((error) => {
      if (active) setState({ loading: false, orders: [], error: error.response?.data?.error || error.message || 'Não foi possível carregar suas contratações.' })
    })
    return () => { active = false }
  }, [retry])

  if (state.loading) return <p className="page-container page-section" role="status">Carregando suas contratações…</p>

  return (
    <section className="page-container page-section service-orders-page" aria-labelledby="orders-title">
      <header className="page-heading">
        <p className="eyebrow">Comprovantes de serviço</p>
        <h1 id="orders-title">Contratações registradas</h1>
        <p>Consulte os detalhes das versões de orçamento aceitas por você.</p>
      </header>
      {state.error ? (
        <Card className="empty-state" role="alert"><h2>Não foi possível carregar as contratações.</h2><p>{state.error}</p><button className="button button--secondary" onClick={() => setRetry((value) => value + 1)} type="button">Tentar novamente</button></Card>
      ) : state.orders.length === 0 ? (
        <Card className="empty-state"><h2>Nenhuma contratação registrada ainda.</h2><p>Quando uma versão de orçamento for aceita, o comprovante ficará disponível aqui.</p><Link className="button button--secondary" to={user.role === 'provider' ? '/conversas' : '/meus-pedidos'}>Voltar aos atendimentos</Link></Card>
      ) : (
        <div className="service-order-list">
          {state.orders.map((order) => (
            <Card className="service-order-list-card" key={order.id}>
              <p className="receipt-kicker">Ordem de serviço · versão {order.versionNumber}</p>
              <h2>{order.requestTitle}</h2>
              <p>{user.role === 'provider' ? `Cliente: ${order.customerName}` : `Prestador: ${order.providerName}`}</p>
              <div className="service-order-list-meta"><strong>{formatAmount(order.amountCents)}</strong><span>Contratação registrada</span></div>
              <Link className="button button--secondary" to={`/contratacoes/${encodeURIComponent(order.id)}`}>Consultar comprovante</Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

export default ServiceOrdersPage
