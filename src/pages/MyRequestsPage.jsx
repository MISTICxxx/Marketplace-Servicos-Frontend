import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import requestService from '../services/requestService.js'
import { formatDesiredDate, formatRequestBudget, formatRequestDate, getCategoryName, statusLabels } from '../utils/requestFormatting.js'

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'open', label: 'Abertos' },
  { id: 'cancelled', label: 'Cancelados' },
]

function loadRequests(userId) {
  try {
    return { requests: requestService.listByUser(userId), error: '' }
  } catch (error) {
    return { requests: [], error: error.message || 'Não foi possível ler os pedidos locais.' }
  }
}

function MyRequestsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [result, setResult] = useState(() => loadRequests(user.id))
  const visibleRequests = result.requests.filter((request) => filter === 'all' || request.status === filter)

  function reloadRequests() {
    setResult(loadRequests(user.id))
  }

  return (
    <section className="page-section page-container my-requests-page">
      <header className="page-heading requests-heading">
        <div>
          <p className="eyebrow">Área da conta</p>
          <h1>Meus pedidos</h1>
          <p>Acompanhe os pedidos que você registrou e seus status.</p>
        </div>
        <Link className="button button--primary" to="/solicitar-servico">Solicitar serviço</Link>
      </header>

      <div className="request-list-toolbar">
        <div aria-label="Filtrar pedidos pelo status" className="request-filter-tabs" role="group">
          {filters.map(({ id, label }) => (
            <button
              aria-pressed={filter === id}
              className={filter === id ? 'request-filter-tab is-active' : 'request-filter-tab'}
              key={id}
              onClick={() => setFilter(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="request-results-count">
          {visibleRequests.length} {visibleRequests.length === 1 ? 'pedido' : 'pedidos'}
        </p>
      </div>

      {result.error ? (
        <div className="empty-state" role="alert">
          <h2>Não foi possível abrir seus pedidos</h2>
          <p>{result.error}</p>
          <Button onClick={reloadRequests}>Tentar novamente</Button>
        </div>
      ) : result.requests.length === 0 ? (
        <div className="empty-state request-empty-state">
          <span aria-hidden="true" className="empty-state-mark">01</span>
          <h2>Seus pedidos começam por aqui.</h2>
          <p>Registre o que você precisa e encontre tudo organizado nesta página.</p>
          <Link className="button button--primary" to="/solicitar-servico">Criar meu primeiro pedido</Link>
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="empty-state" role="status">
          <h2>Nenhum pedido {filter === 'open' ? 'aberto' : 'cancelado'}</h2>
          <p>Altere o filtro para consultar os outros pedidos.</p>
          <Button onClick={() => setFilter('all')} variant="secondary">Ver todos os pedidos</Button>
        </div>
      ) : (
        <div className="request-list">
          {visibleRequests.map((request) => (
            <Card className="request-list-card" key={request.id}>
              <Link className="request-list-link" to={`/meus-pedidos/${request.id}`}>
                <div className="request-list-topline">
                  <span className="request-category-label">{getCategoryName(request.categoryId)}</span>
                  <span className={`request-status request-status--${request.status}`}>{statusLabels[request.status]}</span>
                </div>
                <h2>{request.title}</h2>
                <p className="request-list-location">
                  {[request.neighborhood, request.city, request.region].filter(Boolean).join(', ')}
                </p>
                <dl className="request-list-meta">
                  <div><dt>Criado</dt><dd>{formatRequestDate(request.createdAt)}</dd></div>
                  <div><dt>Data desejada</dt><dd>{formatDesiredDate(request.desiredDate)}</dd></div>
                  <div><dt>Orçamento</dt><dd>{formatRequestBudget(request)}</dd></div>
                </dl>
                <span className="request-list-action">Ver detalhes <span aria-hidden="true">→</span></span>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyRequestsPage
