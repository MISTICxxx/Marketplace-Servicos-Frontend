import api from './api.js'

const MAX_MESSAGE_LENGTH = 2000

async function listByUser() {
  const { data } = await api.get('/conversations')
  return data.data
}

const listByProvider = listByUser

async function getForParticipant(_userId, conversationId) {
  try {
    const { data } = await api.get(`/conversations/${encodeURIComponent(conversationId)}`)
    return data.conversation
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

const getById = getForParticipant

async function createOrGet(_ownerId, requestId, providerId) {
  const { data } = await api.post('/conversations', { requestId, providerId })
  return data
}

async function sendMessage(_ownerId, conversationId, text) {
  const { data } = await api.post(`/conversations/${encodeURIComponent(conversationId)}/messages`, { text })
  return data.conversation
}

const sendAsParticipant = sendMessage

async function markReadForParticipant(_userId, conversationId) {
  const { data } = await api.post(`/conversations/${encodeURIComponent(conversationId)}/read`)
  return data.conversation
}

const markRead = markReadForParticipant

function countUnread(conversation) {
  return conversation.messages.filter((message) => message.senderType === 'provider' && !message.readAt).length
}

const conversationService = { countUnread, createOrGet, getById, getForParticipant, listByProvider, listByUser, markRead, markReadForParticipant, sendAsParticipant, sendMessage }
export { MAX_MESSAGE_LENGTH }
export default conversationService
