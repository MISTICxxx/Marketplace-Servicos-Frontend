import api from './api.js'

const TOKEN_KEY = 'fechou.auth.token'

function setSession(token) {
  window.sessionStorage.setItem(TOKEN_KEY, token)
}

async function createAccount(details) {
  const { data } = await api.post('/auth/register', details, { skipAuth: true, skipAuthResetOn401: true })
  setSession(data.token)
  return data.user
}

async function signIn({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password }, { skipAuth: true, skipAuthResetOn401: true })
  setSession(data.token)
  return data.user
}

async function getCurrentUser() {
  if (!window.sessionStorage.getItem(TOKEN_KEY)) return null
  try {
    const { data } = await api.get('/auth/me')
    return data.user
  } catch (error) {
    if (error.response?.status !== 401) throw error
    window.sessionStorage.removeItem(TOKEN_KEY)
    return null
  }
}

async function updateProfile(changes) {
  const { data } = await api.patch('/profile', changes)
  return data.user
}

async function logout() {
  try { await api.post('/auth/logout') } finally { window.sessionStorage.removeItem(TOKEN_KEY) }
}

const authService = { createAccount, getCurrentUser, logout, signIn, updateProfile }
export default authService
