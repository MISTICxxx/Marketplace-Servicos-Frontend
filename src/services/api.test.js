import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api.js'

let originalAdapter

function createUnauthorizedError(config) {
  const error = new AxiosError('HTTP 401', AxiosError.ERR_BAD_REQUEST, config)
  error.response = { config, data: { error: 'unauthorized' }, headers: {}, status: 401, statusText: 'Unauthorized' }
  return error
}

describe('cliente HTTP e sessão', () => {
  beforeEach(() => {
    originalAdapter = api.defaults.adapter
    window.sessionStorage.setItem('fechou.auth.token', 'test-only-token')
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
  })

  it('envia Bearer somente em chamadas autenticadas', async () => {
    const requests = []
    api.defaults.adapter = async (config) => {
      requests.push(config)
      return { config, data: {}, headers: {}, status: 200, statusText: 'OK' }
    }

    await api.get('/providers', { skipAuth: true })
    await api.get('/requests')

    expect(requests[0].headers.get('Authorization')).toBeUndefined()
    expect(requests[1].headers.get('Authorization')).toBe('Bearer test-only-token')
  })

  it('preserva a sessão em 401 de login, mas encerra sessão em 401 autenticado', async () => {
    let unauthorizedEvents = 0
    const handleUnauthorized = () => { unauthorizedEvents += 1 }
    window.addEventListener('fechou:unauthorized', handleUnauthorized)
    api.defaults.adapter = async (config) => { throw createUnauthorizedError(config) }

    await expect(api.post('/auth/login', { email: 'test@example.invalid' }, {
      skipAuth: true,
      skipAuthResetOn401: true,
    })).rejects.toMatchObject({ response: { status: 401 } })
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBe('test-only-token')
    expect(unauthorizedEvents).toBe(0)

    await expect(api.get('/requests')).rejects.toMatchObject({ response: { status: 401 } })
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBeNull()
    expect(unauthorizedEvents).toBe(1)
    window.removeEventListener('fechou:unauthorized', handleUnauthorized)
  })

  it('não encerra a sessão quando um endpoint público responde 401', async () => {
    const handleUnauthorized = vi.fn()
    window.addEventListener('fechou:unauthorized', handleUnauthorized)
    api.defaults.adapter = async (config) => { throw createUnauthorizedError(config) }

    await expect(api.get('/providers', { skipAuth: true })).rejects.toMatchObject({ response: { status: 401 } })
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBe('test-only-token')
    expect(handleUnauthorized).not.toHaveBeenCalled()

    window.removeEventListener('fechou:unauthorized', handleUnauthorized)
  })

  it.each([
    ['403', { status: 403 }],
    ['5xx', { status: 503 }],
    ['falha de rede', null],
  ])('não remove a sessão em %s', async (_label, response) => {
    api.defaults.adapter = async (config) => {
      const error = new AxiosError('request failed', AxiosError.ERR_NETWORK, config)
      if (response) {
        error.response = { config, data: {}, headers: {}, status: response.status, statusText: 'Error' }
      }
      throw error
    }

    await expect(api.get('/requests')).rejects.toBeInstanceOf(AxiosError)
    expect(window.sessionStorage.getItem('fechou.auth.token')).toBe('test-only-token')
  })
})
