import api from './api.js'

async function list(requestId) {
  const { data } = await api.get('/service-orders', { params: requestId ? { requestId } : undefined })
  return data.data
}

async function getById(orderId) {
  const { data } = await api.get(`/service-orders/${encodeURIComponent(orderId)}`)
  return data.order
}

const serviceOrderService = { getById, list }
export default serviceOrderService
