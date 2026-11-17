import api from './api.js'

async function listForRequest(requestId) {
  const { data } = await api.get(`/requests/${encodeURIComponent(requestId)}/quotes`)
  return data.data
}

async function listForConversation(conversationId) {
  const { data } = await api.get(`/conversations/${encodeURIComponent(conversationId)}/quotes`)
  return data.data
}

async function createForConversation(conversationId, quote) {
  const { data } = await api.post(`/conversations/${encodeURIComponent(conversationId)}/quotes`, quote)
  return data.quote
}

async function getById(quoteId) {
  const { data } = await api.get(`/quotes/${encodeURIComponent(quoteId)}`)
  return data.quote
}

async function listVersions(quoteId) {
  const { data } = await api.get(`/quotes/${encodeURIComponent(quoteId)}/versions`)
  return data.data
}

async function revise(quoteId, version) {
  const { data } = await api.post(`/quotes/${encodeURIComponent(quoteId)}/versions`, version)
  return data.quote
}

async function withdraw(quoteId) {
  const { data } = await api.post(`/quotes/${encodeURIComponent(quoteId)}/withdraw`)
  return data.quote
}

async function acceptVersion(quoteId, versionId) {
  const { data } = await api.post(`/quotes/${encodeURIComponent(quoteId)}/accept`, { versionId })
  return data
}

const quoteService = { acceptVersion, createForConversation, getById, listForConversation, listForRequest, listVersions, revise, withdraw }
export default quoteService
