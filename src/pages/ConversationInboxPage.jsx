import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import ProviderAvatar from '../components/ProviderAvatar.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import conversationService from '../services/conversationService.js'
import { getProviderById } from '../services/providerService.js'
import requestService from '../services/requestService.js'
import { getCategoryName, statusLabels } from '../utils/requestFormatting.js'
import ProviderConversationsPage from './ProviderConversationsPage.jsx'

async function loadInbox() {
  try {
    return {
      conversations: await conversationService.listByUser(),
      requests: await requestService.listByUser(),
      error: '',
    }
  } catch (error) {
    return { conversations: [], requests: [], error: error.message || 'Não foi possível carregar os dados da sua conta.' }
  }
}

function formatConversationDate(value) {
  if (!value) return 'Sem mensagens'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data indisponível'
  const sameDay = date.toDateString() === new Date().toDateString()
  return new Intl.DateTimeFormat('pt-BR', sameDay
    ? { timeStyle: 'short' }
    : { day: '2-digit', month: 'short' }).format(date)
}

function getUnreadCount(conversation) {
  return conversationService.countUnread(conversation)
}

function StartConversationPanel({ providerId, ownerId, requests, onOpen }) {
  const [provider, setProvider] = useState(null)
  const [providerLoading, setProviderLoading] = useState(true)
  const openRequests = requests.filter((request) => request.status === 'open')
  const [requestId, setRequestId] = useState(openRequests[0]?.id ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    getProviderById(providerId).then((result) => { if (active) setProvider(result) }).catch(() => { if (active) setProvider(null) }).finally(() => { if (active) setProviderLoading(false) })
    return () => { active = false }
  }, [providerId])

  if (providerLoading) return <Card className="conversation-start-panel" role="status">Carregando perfil…</Card>
  if (!provider) {
    return (
      <Card className="conversation-start-panel" role="status">
        <p className="eyebrow">Prestador indisponível</p>
        <p>Não foi possível localizar este perfil.</p>
        <Link className="text-link" to="/servicos">Voltar ao diretório</Link>
      </Card>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!requestId || isSubmitting) return
    setIsSubmitting(true)
    setError('')
    try {
      const selectedRequestId = openRequests.some((request) => request.id === requestId) ? requestId : openRequests[0]?.id
      const result = await conversationService.createOrGet(
        ownerId,
        selectedRequestId,
        provider.id,
      )
      onOpen(result)
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível abrir a conversa.')
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="conversation-start-panel">
      <div className="conversation-start-heading">
        <ProviderAvatar category={provider.categories[0]} name={provider.name} />
        <div>
          <p className="eyebrow">Nova conversa</p>
          <h2>{provider.name}</h2>
          <p>{provider.specialty}</p>
        </div>
      </div>
      {openRequests.length ? (
        <form className="conversation-start-form" onSubmit={handleSubmit}>
          <label htmlFor="conversation-request">Sobre qual pedido aberto?</label>
          <select
            id="conversation-request"
            onChange={(event) => setRequestId(event.target.value)}
            value={openRequests.some((request) => request.id === requestId) ? requestId : openRequests[0]?.id ?? ''}
          >
            {openRequests.map((request) => (
              <option key={request.id} value={request.id}>{request.title} · {getCategoryName(request.categoryId)}</option>
            ))}
          </select>
          {error && <p className="conversation-feedback conversation-feedback--error" role="alert">{error}</p>}
          <Button disabled={isSubmitting || !requestId} type="submit">
            {isSubmitting ? 'Abrindo…' : 'Abrir conversa'}
          </Button>
        </form>
      ) : (
        <div className="conversation-start-empty">
          <p>Para conversar, primeiro crie um pedido. Apenas pedidos abertos da sua conta podem ser associados.</p>
          <Link className="button button--primary" to="/solicitar-servico">Criar um pedido</Link>
        </div>
      )}
    </Card>
  )
}

function ConversationInboxPage() {
  const { user } = useAuth()
  return user.role === 'provider' ? <ProviderConversationsPage /> : <CustomerConversationInboxPage user={user} />
}

function CustomerConversationInboxPage({ user }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [inbox, setInbox] = useState({ conversations: [], requests: [], error: '', loading: true })
  const selectedProvider = searchParams.get('prestador')
  const requestsById = new Map(inbox.requests.map((request) => [request.id, request]))
  const groups = new Map()

  inbox.conversations.forEach((conversation) => {
    const request = requestsById.get(conversation.requestId)
    const group = groups.get(conversation.requestId) ?? { request, conversations: [] }
    group.conversations.push(conversation)
    groups.set(conversation.requestId, group)
  })

  async function refreshInbox() {
    try {
      setInbox({ ...(await loadInbox()), loading: false })
    } catch (error) {
      setInbox({ conversations: [], requests: [], error: error.response?.data?.error || error.message || 'Não foi possível carregar a caixa de entrada.', loading: false })
    }
  }

  useEffect(() => {
    let active = true
    loadInbox().then((loaded) => { if (active) setInbox({ ...loaded, loading: false }) })
    return () => { active = false }
  }, [user.id])

  function handleOpen({ conversation, created }) {
    navigate(`/conversas/${conversation.id}`, {
      state: { notice: created
        ? 'Conversa criada.'
        : 'Você voltou à conversa já existente para este pedido.' },
    })
  }

  const entries = [...groups.entries()].sort((first, second) => {
    const firstTime = first[1].conversations[0]?.lastMessageAt ?? first[1].conversations[0]?.createdAt ?? ''
    const secondTime = second[1].conversations[0]?.lastMessageAt ?? second[1].conversations[0]?.createdAt ?? ''
    return secondTime.localeCompare(firstTime)
  })

  return (
    <section className="page-section page-container conversation-inbox-page" aria-labelledby="conversation-inbox-title">
      <header className="conversation-page-heading">
        <div>
          <p className="eyebrow">Caixa de entrada</p>
          <h1 id="conversation-inbox-title">Conversas</h1>
          <p>Mensagens organizadas por pedido de serviço.</p>
        </div>
        <Link className="button button--secondary" to="/meus-pedidos">Ver meus pedidos</Link>
      </header>

      {selectedProvider && !inbox.loading && !inbox.error && (
        <StartConversationPanel
          onOpen={handleOpen}
          providerId={selectedProvider}
          requests={inbox.requests}
          ownerId={user.id}
        />
      )}

      {inbox.loading ? <p role="status">Carregando conversas…</p> : inbox.error ? (
        <Card className="conversation-empty-state" role="alert">
          <h2>Não foi possível abrir sua caixa de entrada.</h2>
          <p>{inbox.error}</p>
          <Button onClick={() => void refreshInbox()} variant="secondary">Tentar novamente</Button>
        </Card>
      ) : inbox.conversations.length === 0 ? (
        <Card className="conversation-empty-state">
          <p className="eyebrow">Ainda sem conversas</p>
          <h2>As conversas ficam ligadas a um pedido.</h2>
          <p>Explore um perfil e escolha um pedido aberto para iniciar uma conversa.</p>
          <div className="conversation-empty-actions">
            <Link className="button button--primary" to="/servicos">Encontrar prestadores</Link>
            <Link className="button button--secondary" to="/meus-pedidos">Ver meus pedidos</Link>
          </div>
        </Card>
      ) : (
        <div className="conversation-groups">
          {entries.map(([requestId, group]) => (
            <section className="conversation-request-group" key={requestId} aria-labelledby={`request-group-${requestId}`}>
              <header className="conversation-group-heading">
                <div>
                  <p className="eyebrow">Pedido · {group.request ? statusLabels[group.request.status] ?? 'Indisponível' : 'Indisponível'}</p>
                  <h2 id={`request-group-${requestId}`}>{group.request?.title ?? 'Pedido indisponível'}</h2>
                </div>
                {group.request && <Link to={`/meus-pedidos/${group.request.id}`}>Ver pedido <span aria-hidden="true">→</span></Link>}
              </header>
              <div className="conversation-list">
                {group.conversations.map((conversation) => {
                  const provider = conversation.provider
                  const lastMessage = conversation.messages.at(-1)
                  const unreadCount = getUnreadCount(conversation)
                  return (
                    <Link className="conversation-list-item" key={conversation.id} to={`/conversas/${conversation.id}`}>
                      {provider
                        ? <ProviderAvatar category={provider.categories[0]} name={provider.name} />
                        : <span aria-hidden="true" className="provider-avatar">?</span>}
                      <span className="conversation-list-copy">
                        <span className="conversation-list-title">
                          <strong>{provider?.name ?? 'Prestador indisponível'}</strong>
                          <time dateTime={lastMessage?.sentAt ?? conversation.createdAt}>{formatConversationDate(lastMessage?.sentAt)}</time>
                        </span>
                        <span className="conversation-list-specialty">{provider?.specialty ?? 'Perfil indisponível'} · {getCategoryName(group.request?.categoryId)}</span>
                        <span className="conversation-list-snippet">{lastMessage?.text ?? 'Conversa iniciada · envie a primeira mensagem'}</span>
                      </span>
                      {unreadCount > 0 && <span className="conversation-unread-badge" aria-label={`${unreadCount} mensagens não lidas`}>{unreadCount}</span>}
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}

export default ConversationInboxPage
