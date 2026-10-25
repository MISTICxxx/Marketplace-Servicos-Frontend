import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import ProviderAvatar from '../components/ProviderAvatar.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import conversationService, { MAX_MESSAGE_LENGTH } from '../services/conversationService.js'
import { getProviderById } from '../services/providerService.js'
import requestService from '../services/requestService.js'
import { getCategoryName, statusLabels } from '../utils/requestFormatting.js'

function loadConversation(ownerId, conversationId) {
  try {
    const conversation = conversationService.getById(ownerId, conversationId)
    if (!conversation) return { conversation: null, error: '' }
    const readConversation = conversationService.markRead(ownerId, conversationId) ?? conversation
    return {
      conversation: readConversation,
      request: requestService.getById(ownerId, conversation.requestId),
      provider: getProviderById(conversation.providerId) ?? null,
      error: '',
    }
  } catch (error) {
    return { conversation: null, error: error.message || 'Não foi possível carregar esta conversa.' }
  }
}

function formatTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Horário indisponível'
    : new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date)
}

function formatDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data indisponível'
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hoje'
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date)
}

function groupMessages(messages) {
  const groups = []
  messages.forEach((message) => {
    const date = new Date(message.sentAt)
    const key = Number.isNaN(date.getTime()) ? 'invalid-date' : date.toDateString()
    let group = groups.at(-1)
    if (!group || group.key !== key) {
      group = { key, label: formatDay(message.sentAt), messages: [] }
      groups.push(group)
    }
    group.messages.push(message)
  })
  return groups
}

function ConversationPage({ ownerId }) {
  const { conversationId } = useParams()
  const [chat, setChat] = useState(() => loadConversation(ownerId, conversationId))
  const [draft, setDraft] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const actionLockRef = useRef(false)
  const messagesEndRef = useRef(null)
  const { state } = useLocation()
  const conversation = chat.conversation
  const isReadOnly = !chat.request || chat.request.status !== 'open' || !chat.provider

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [conversation?.messages.length])

  function runAction(action, clearDraft = false) {
    if (actionLockRef.current) return
    actionLockRef.current = true
    setIsSending(true)
    setActionError('')
    try {
      const updated = action()
      setChat((current) => ({ ...current, conversation: updated }))
      if (clearDraft) setDraft('')
    } catch (error) {
      setActionError(error.message || 'Não foi possível salvar a mensagem. O texto foi mantido para você tentar novamente.')
    } finally {
      setIsSending(false)
      actionLockRef.current = false
    }
  }

  function handleSend(event) {
    event.preventDefault()
    if (isSending || !conversation || isReadOnly) return
    const trimmedDraft = draft.trim()
    if (!trimmedDraft) {
      setActionError('Escreva uma mensagem antes de enviar.')
      return
    }
    if (trimmedDraft.length > MAX_MESSAGE_LENGTH) {
      setActionError(`A mensagem deve ter até ${MAX_MESSAGE_LENGTH} caracteres.`)
      return
    }
    runAction(() => conversationService.sendMessage(ownerId, conversation.id, trimmedDraft), true)
  }

  function handleDemoReply() {
    if (!conversation || isReadOnly) return
    runAction(() => conversationService.addDemoReply(ownerId, conversation.id))
  }

  if (chat.error) {
    return (
      <section className="page-section page-container conversation-page" aria-labelledby="conversation-error-title">
        <Link className="text-link conversation-back-link" to="/conversas">← Voltar à caixa de entrada</Link>
        <Card className="conversation-empty-state" role="alert">
          <h1 id="conversation-error-title">Não foi possível abrir a conversa.</h1>
          <p>{chat.error}</p>
          <Link className="button button--secondary" to="/conversas">Voltar à caixa de entrada</Link>
        </Card>
      </section>
    )
  }

  if (!conversation) {
    return (
      <section className="page-section page-container conversation-page" aria-labelledby="conversation-missing-title">
        <Link className="text-link conversation-back-link" to="/conversas">← Voltar à caixa de entrada</Link>
        <Card className="conversation-empty-state">
          <p className="eyebrow">Conversa indisponível</p>
          <h1 id="conversation-missing-title">Não encontramos esta conversa.</h1>
          <p>Ela pode não existir ou não estar disponível para esta conta.</p>
          <Link className="button button--primary" to="/conversas">Abrir minha caixa de entrada</Link>
        </Card>
      </section>
    )
  }

  const providerName = chat.provider?.name ?? 'Prestador indisponível'
  const groups = groupMessages(conversation.messages)
  const characterCount = draft.length
  const readOnlyMessage = chat.request?.status === 'cancelled'
    ? 'Este pedido foi cancelado. O histórico permanece disponível, mas a conversa está somente para leitura.'
    : !chat.request
      ? 'O pedido associado não está disponível para esta conta. O histórico pode ser consultado, mas novas mensagens estão desativadas.'
      : 'O perfil do prestador não está disponível. O histórico pode ser consultado, mas novas mensagens estão desativadas.'

  return (
    <section className="page-section page-container conversation-page" aria-labelledby="conversation-title">
      <Link className="text-link conversation-back-link" to="/conversas">← Voltar à caixa de entrada</Link>
      {state?.notice && <p className="conversation-success" role="status">{state.notice}</p>}
      <Card className="conversation-chat-shell">
        <header className="conversation-chat-heading">
          <Link aria-label="Voltar à caixa de entrada" className="conversation-mobile-back" to="/conversas">←</Link>
          {chat.provider
            ? <ProviderAvatar category={chat.provider.categories[0]} name={providerName} />
            : <span aria-hidden="true" className="provider-avatar">?</span>}
          <div className="conversation-chat-identity">
            <p className="eyebrow">Conversa</p>
            <h1 id="conversation-title">{providerName}</h1>
            <p>{chat.provider?.specialty ?? 'Perfil indisponível'}</p>
          </div>
          <div className="conversation-order-context">
            <span>Pedido relacionado</span>
            {chat.request
              ? <Link to={`/meus-pedidos/${chat.request.id}`}>{chat.request.title}</Link>
              : <strong>Pedido indisponível</strong>}
            {chat.request && <small>{getCategoryName(chat.request.categoryId)} · {statusLabels[chat.request.status] ?? 'Indisponível'}</small>}
          </div>
        </header>

        {isReadOnly && <p className="conversation-readonly-note" role="status">{readOnlyMessage}</p>}

        <div aria-label="Histórico de mensagens" aria-live="polite" className="conversation-messages" role="log">
          {conversation.messages.length === 0 ? (
            <div className="conversation-no-messages">
              <p className="eyebrow">Início do histórico</p>
              <p>Esta conversa está vinculada a <strong>{chat.request?.title ?? 'um pedido indisponível'}</strong>. Escreva uma mensagem para iniciar o histórico.</p>
            </div>
          ) : groups.map((group) => (
            <div className="conversation-message-group" key={group.key}>
              <p className="conversation-day-divider"><span>{group.label}</span></p>
              {group.messages.map((message) => {
                const isMine = message.senderType === 'customer'
                return (
                  <article
                    aria-label={`${isMine ? 'Sua mensagem' : 'Resposta de exemplo'}, ${formatTime(message.sentAt)}`}
                    className={`conversation-message${isMine ? ' conversation-message--mine' : ' conversation-message--provider'}`}
                    key={message.id}
                  >
                    {!isMine && <span className="conversation-message-author">{message.isDemo ? 'Resposta de exemplo' : providerName}</span>}
                    <p>{message.text}</p>
                    <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
                  </article>
                )
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <footer className="conversation-compose-area">
          {!isReadOnly && (
            <div className="conversation-demo-reply-row">
              <span>Visualize o outro lado da conversa.</span>
              <Button disabled={isSending} onClick={handleDemoReply} variant="secondary">
                Inserir resposta de exemplo
              </Button>
            </div>
          )}
          {actionError && <p className="conversation-feedback conversation-feedback--error" id="conversation-action-error" role="alert">{actionError}</p>}
          <form className="conversation-compose-form" onSubmit={handleSend}>
            <label className="visually-hidden" htmlFor="conversation-message">Escreva sua mensagem</label>
            <textarea
              aria-describedby={actionError ? 'conversation-action-error conversation-character-count' : 'conversation-character-count'}
              aria-invalid={actionError === 'Escreva uma mensagem antes de enviar.' || actionError.startsWith('A mensagem deve ter até')}
              disabled={isReadOnly || isSending}
              id="conversation-message"
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event) => { setDraft(event.target.value); setActionError('') }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              placeholder={isReadOnly ? 'Esta conversa está somente para leitura.' : 'Escreva uma mensagem…'}
              rows="2"
              value={draft}
            />
            <div className="conversation-compose-controls">
              <span aria-live="polite" id="conversation-character-count">
                {characterCount > MAX_MESSAGE_LENGTH - 200
                  ? `${characterCount}/${MAX_MESSAGE_LENGTH} caracteres`
                  : 'Enter envia · Shift + Enter quebra a linha'}
              </span>
              <Button disabled={isReadOnly || isSending || !draft.trim()} type="submit">
                {isSending ? 'Salvando…' : 'Enviar mensagem'}
              </Button>
            </div>
          </form>
          <p className="conversation-local-note">Mensagens salvas neste navegador; não são enviadas ao prestador.</p>
        </footer>
      </Card>
    </section>
  )
}

function ConversationRoute() {
  const { user } = useAuth()
  const { conversationId } = useParams()
  return <ConversationPage key={conversationId} ownerId={user.id} />
}

export default ConversationRoute
