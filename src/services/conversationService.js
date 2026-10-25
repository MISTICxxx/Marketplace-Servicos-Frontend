import requestService from './requestService.js'
import { getProviderById } from './providerService.js'

const CONVERSATIONS_KEY = 'fechou.demo.conversations.v1'
const MAX_MESSAGE_LENGTH = 2000

function createId(prefix) {
  return globalThis.crypto?.randomUUID?.()
    ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function requireOwnerId(ownerId) {
  if (typeof ownerId !== 'string' || !ownerId.trim()) {
    throw new Error('Entre na sua conta para continuar.')
  }
  return ownerId
}

function readConversations() {
  let saved
  try {
    saved = window.localStorage.getItem(CONVERSATIONS_KEY)
  } catch {
    throw new Error('Não foi possível acessar as conversas locais neste navegador.')
  }
  if (!saved) return []

  try {
    const conversations = JSON.parse(saved)
    if (!Array.isArray(conversations)) throw new Error('Formato inválido')
    const valid = conversations.every((conversation) => (
      conversation
      && typeof conversation.id === 'string'
      && typeof conversation.requestId === 'string'
      && typeof conversation.ownerId === 'string'
      && typeof conversation.providerId === 'string'
      && typeof conversation.createdAt === 'string'
      && typeof conversation.updatedAt === 'string'
      && (conversation.lastMessageAt === null || typeof conversation.lastMessageAt === 'string')
      && Array.isArray(conversation.messages)
      && conversation.messages.every((message) => (
        message
        && typeof message.id === 'string'
        && message.conversationId === conversation.id
        && typeof message.senderId === 'string'
        && typeof message.text === 'string'
        && typeof message.sentAt === 'string'
        && ['customer', 'provider'].includes(message.senderType)
        && message.senderId === (message.senderType === 'customer' ? conversation.ownerId : conversation.providerId)
        && typeof message.isDemo === 'boolean'
        && (message.readAt === null || typeof message.readAt === 'string')
      ))
    ))
    if (!valid) throw new Error('Dados inconsistentes')
    return conversations
  } catch {
    throw new Error('Não foi possível ler as conversas salvas. Os dados não foram alterados.')
  }
}

function saveConversations(conversations) {
  try {
    window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
  } catch {
    throw new Error('Não foi possível salvar a conversa neste navegador. Verifique o espaço disponível e tente novamente.')
  }
}

function findOwnedConversation(conversations, ownerId, conversationId) {
  return conversations.find((conversation) => (
    conversation.id === conversationId && conversation.ownerId === ownerId
  )) ?? null
}

function assertOpenRequest(ownerId, requestId) {
  const request = requestService.getById(ownerId, requestId)
  if (!request) throw new Error('O pedido associado não está disponível para esta conta.')
  if (request.status !== 'open') throw new Error('Este pedido está cancelado. O histórico pode ser consultado, mas não aceita novas mensagens.')
  return request
}

function createMessage(conversation, senderId, senderType, text, isDemo = false) {
  return {
    id: createId('mensagem'),
    conversationId: conversation.id,
    senderId,
    senderType,
    text,
    sentAt: new Date().toISOString(),
    isDemo,
    readAt: null,
  }
}

function listByUser(ownerId) {
  const currentOwnerId = requireOwnerId(ownerId)
  return readConversations()
    .filter((conversation) => conversation.ownerId === currentOwnerId)
    .sort((first, second) => (second.lastMessageAt ?? second.createdAt).localeCompare(first.lastMessageAt ?? first.createdAt))
}

function getById(ownerId, conversationId) {
  const currentOwnerId = requireOwnerId(ownerId)
  return findOwnedConversation(readConversations(), currentOwnerId, conversationId)
}

function createOrGet(ownerId, requestId, providerId) {
  const currentOwnerId = requireOwnerId(ownerId)
  assertOpenRequest(currentOwnerId, requestId)
  if (!getProviderById(providerId)) throw new Error('Este prestador não está disponível.')

  const conversations = readConversations()
  const existing = conversations.find((conversation) => (
    conversation.ownerId === currentOwnerId
    && conversation.requestId === requestId
    && conversation.providerId === providerId
  ))
  if (existing) return { conversation: existing, created: false }

  const now = new Date().toISOString()
  const conversation = {
    id: createId('conversa'),
    requestId,
    ownerId: currentOwnerId,
    providerId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: null,
    messages: [],
  }
  saveConversations([...conversations, conversation])
  return { conversation, created: true }
}

function appendMessage(ownerId, conversationId, text, senderType) {
  const currentOwnerId = requireOwnerId(ownerId)
  const normalizedText = String(text ?? '').trim()
  if (!normalizedText) throw new Error('Escreva uma mensagem antes de enviar.')
  if (normalizedText.length > MAX_MESSAGE_LENGTH) throw new Error(`A mensagem deve ter até ${MAX_MESSAGE_LENGTH} caracteres.`)

  const conversations = readConversations()
  const index = conversations.findIndex((conversation) => (
    conversation.id === conversationId && conversation.ownerId === currentOwnerId
  ))
  if (index < 0) throw new Error('Conversa não encontrada ou indisponível.')

  const conversation = conversations[index]
  assertOpenRequest(currentOwnerId, conversation.requestId)
  const provider = getProviderById(conversation.providerId)
  if (!provider) throw new Error('O prestador associado não está disponível.')

  const message = createMessage(
    conversation,
    senderType === 'provider' ? provider.id : currentOwnerId,
    senderType,
    normalizedText,
    senderType === 'provider',
  )
  const updated = {
    ...conversation,
    messages: [...conversation.messages, message],
    lastMessageAt: message.sentAt,
    updatedAt: message.sentAt,
  }
  conversations[index] = updated
  saveConversations(conversations)
  return updated
}

function sendMessage(ownerId, conversationId, text) {
  return appendMessage(ownerId, conversationId, text, 'customer')
}

function addDemoReply(ownerId, conversationId) {
  return appendMessage(
    ownerId,
    conversationId,
    'Resposta de exemplo. Nenhum profissional real recebeu ou respondeu à mensagem.',
    'provider',
  )
}

function markRead(ownerId, conversationId) {
  const currentOwnerId = requireOwnerId(ownerId)
  const conversations = readConversations()
  const index = conversations.findIndex((conversation) => (
    conversation.id === conversationId && conversation.ownerId === currentOwnerId
  ))
  if (index < 0) return null

  const conversation = conversations[index]
  const readAt = new Date().toISOString()
  let changed = false
  const messages = conversation.messages.map((message) => {
    if (message.senderType !== 'provider' || message.readAt) return message
    changed = true
    return { ...message, readAt }
  })
  if (!changed) return conversation

  const updated = { ...conversation, messages }
  conversations[index] = updated
  saveConversations(conversations)
  return updated
}

function countUnread(conversation) {
  return conversation.messages.filter((message) => (
    message.senderType === 'provider' && !message.readAt
  )).length
}

const conversationService = {
  addDemoReply,
  countUnread,
  createOrGet,
  getById,
  listByUser,
  markRead,
  sendMessage,
}

export { CONVERSATIONS_KEY, MAX_MESSAGE_LENGTH }
export default conversationService
