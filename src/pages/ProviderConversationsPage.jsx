import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import Card from '../components/common/Card.jsx'
import conversationService from '../services/conversationService.js'
import { getCategoryName } from '../utils/requestFormatting.js'

function ProviderConversationsPage() {
  const { user } = useAuth()
  const [result, setResult] = useState({ conversations: [], error: '', loading: true })
  useEffect(() => {
    let active = true
    conversationService.listByProvider().then((conversations) => {
      if (active) setResult({ conversations, error: '', loading: false })
    }).catch((error) => {
      if (active) setResult({ conversations: [], error: error.response?.data?.error || error.message, loading: false })
    })
    return () => { active = false }
  }, [user.id])
  const { conversations, error, loading } = result

  return (
    <section className="page-section page-container conversation-inbox-page" aria-labelledby="provider-inbox-title">
      <header className="conversation-page-heading"><div><p className="eyebrow">Área do prestador</p><h1 id="provider-inbox-title">Conversas com clientes</h1><p>Pedidos recebidos e mensagens dos clientes que entraram em contato com você.</p></div><Link className="button button--secondary" to="/painel-prestador">Voltar ao painel</Link></header>
      {error && <Card role="alert"><p>{error}</p></Card>}
      {loading && <p role="status">Carregando conversas…</p>}
      {!error && conversations.length === 0 && <Card className="conversation-empty-state"><p className="eyebrow">Caixa de entrada vazia</p><h2>Quando um cliente iniciar uma conversa, ela aparecerá aqui.</h2><p>Publique seu anúncio no diretório e compartilhe seu perfil para receber contatos.</p><Link className="button button--primary" to="/painel-prestador">Criar ou editar anúncio</Link></Card>}
      <div className="conversation-list">
        {conversations.map((conversation) => {
          const request = conversation.request
          const customer = conversation.customer
          const lastMessage = conversation.messages.at(-1)
          const unread = conversation.messages.filter((message) => message.senderType === 'customer' && !message.readAt).length
          return <Link className="conversation-list-item" key={conversation.id} to={`/conversas/${conversation.id}`}>
            <span className="provider-avatar" aria-hidden="true">{(customer?.name ?? 'C').split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
            <span className="conversation-list-copy"><span className="conversation-list-title"><strong>{customer?.name ?? 'Cliente'}</strong><time>{lastMessage ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(lastMessage.sentAt)) : 'Novo contato'}</time></span><span className="conversation-list-specialty">{request?.title ?? 'Pedido'} · {getCategoryName(request?.categoryId)}</span><span className="conversation-list-snippet">{lastMessage?.text ?? 'Conversa iniciada · responda ao cliente'}</span></span>
            {unread > 0 && <span className="conversation-unread-badge" aria-label={`${unread} mensagens não lidas`}>{unread}</span>}
          </Link>
        })}
      </div>
    </section>
  )
}

export default ProviderConversationsPage
