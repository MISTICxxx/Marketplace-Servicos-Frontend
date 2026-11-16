import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 8000,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('fechou.auth.token')
  if (config.skipAuth) config.skipAuthResetOn401 = true
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`
  delete config.skipAuth
  return config
})

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !error.config?.skipAuthResetOn401) {
    window.sessionStorage.removeItem('fechou.auth.token')
    window.dispatchEvent(new Event('fechou:unauthorized'))
  }
  return Promise.reject(error)
})

export default api
