import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import ProviderDashboardPage from './ProviderDashboardPage.jsx'
import { getMyProviderProfile, getServiceCategories, saveProviderAd } from '../services/providerService.js'

vi.mock('../auth/useAuth.js', () => ({ default: vi.fn() }))
vi.mock('../services/providerService.js', () => ({
  getMyProviderProfile: vi.fn(),
  getServiceCategories: vi.fn(),
  saveProviderAd: vi.fn(),
}))

const user = {
  id: 'provider-1',
  name: 'Ana Ferreira',
  role: 'provider',
  city: 'Curitiba',
  region: 'PR',
  bio: 'Experiência com instalações residenciais.',
}

const publishedAd = {
  id: user.id,
  active: true,
  name: user.name,
  specialty: 'Eletricista',
  summary: 'Instalações residenciais',
  bio: user.bio,
  categories: ['eletrica'],
  neighborhoods: ['Centro'],
  services: [{ name: 'Instalar luminária', priceFrom: 95 }],
}

const inactiveAd = {
  ...publishedAd,
  active: false,
  specialty: 'Eletricista com perfil inativo',
  summary: 'Anúncio temporariamente oculto',
  neighborhoods: ['Centro', 'Batel'],
  services: [{ name: 'Instalar luminária', priceFrom: 95 }],
}

function renderDashboard() {
  return render(<MemoryRouter><ProviderDashboardPage /></MemoryRouter>)
}

function fillAdForm() {
  fireEvent.change(screen.getByLabelText('Especialidade'), { target: { value: 'Eletricista' } })
  fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'eletrica' } })
  fireEvent.change(screen.getByLabelText('Resumo do anúncio'), { target: { value: 'Instalações residenciais' } })
  fireEvent.change(screen.getByLabelText('Apresentação'), { target: { value: 'Experiência com instalações residenciais.' } })
  fireEvent.change(screen.getByLabelText('Bairros atendidos, separados por vírgula'), { target: { value: 'Centro' } })
  fireEvent.change(screen.getByLabelText(/Serviços e preço inicial/), { target: { value: 'Instalar luminária | 95' } })
}

async function submitAd() {
  fireEvent.submit(screen.getByRole('button', { name: /Publicar anúncio|Salvar anúncio/ }).closest('form'))
}

describe('ProviderDashboardPage — anúncio e perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user, updateProfile: vi.fn().mockResolvedValue(user) })
    getServiceCategories.mockReturnValue([{ id: 'eletrica', name: 'Elétrica' }])
    getMyProviderProfile.mockResolvedValue(null)
    saveProviderAd.mockResolvedValue(publishedAd)
  })

  it('não apresenta formulário vazio antes de concluir o carregamento', async () => {
    let resolveRequest
    getMyProviderProfile.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))
    renderDashboard()

    expect(screen.getByRole('status').textContent).toContain('Carregando seu anúncio')
    expect(screen.queryByRole('form')).toBeNull()

    resolveRequest(null)
    expect(await screen.findByRole('button', { name: 'Publicar anúncio' })).not.toBeNull()
  })

  it('carrega os dados de um anúncio ativo para edição', async () => {
    getMyProviderProfile.mockResolvedValueOnce(publishedAd)
    renderDashboard()

    expect(await screen.findByRole('button', { name: 'Salvar anúncio' })).not.toBeNull()
    expect(screen.getByLabelText('Especialidade').value).toBe('Eletricista')
    expect(screen.getByLabelText('Resumo do anúncio').value).toBe('Instalações residenciais')
    expect(screen.getByRole('link', { name: /Ver meu perfil público/ }).getAttribute('href')).toBe(`/prestadores/${user.id}`)
  })

  it('permite iniciar um anúncio quando o endpoint próprio retorna 404 como perfil inexistente', async () => {
    getMyProviderProfile.mockResolvedValueOnce(null)
    renderDashboard()

    expect(await screen.findByRole('button', { name: 'Publicar anúncio' })).not.toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('carrega todos os campos do perfil inativo e informa que salvar o reativa', async () => {
    getMyProviderProfile.mockResolvedValueOnce(inactiveAd)
    renderDashboard()

    expect(await screen.findByRole('button', { name: 'Salvar anúncio' })).not.toBeNull()
    expect(screen.getByLabelText('Especialidade').value).toBe(inactiveAd.specialty)
    expect(screen.getByLabelText('Resumo do anúncio').value).toBe(inactiveAd.summary)
    expect(screen.getByLabelText('Bairros atendidos, separados por vírgula').value).toBe('Centro, Batel')
    expect(screen.getByLabelText(/Serviços e preço inicial/).value).toBe('Instalar luminária | 95')
    expect(screen.getByRole('status').textContent).toContain('está inativo e não aparece para clientes')
    expect(screen.queryByRole('link', { name: /Ver meu perfil público/ })).toBeNull()

    await submitAd()

    expect(saveProviderAd).toHaveBeenCalledWith({
      specialty: inactiveAd.specialty,
      summary: inactiveAd.summary,
      categories: ['eletrica'],
      neighborhoods: ['Centro', 'Batel'],
      services: [{ name: 'Instalar luminária', priceFrom: 95 }],
    })
    expect(await screen.findByText('Seu anúncio está ativo e visível no diretório.')).not.toBeNull()
  })

  it('trata a linha inativa vazia criada no cadastro como primeiro anúncio a publicar', async () => {
    getMyProviderProfile.mockResolvedValueOnce({
      id: user.id, active: false, specialty: '', summary: '', categories: [], neighborhoods: [], services: [],
    })
    renderDashboard()

    expect(await screen.findByRole('button', { name: 'Publicar anúncio' })).not.toBeNull()
    expect(screen.getByRole('status').textContent).toContain('ainda não tem um anúncio publicado')
  })

  it.each([
    ['rede', new Error('network'), 'Não foi possível conectar'],
    ['servidor', { response: { status: 503 } }, 'temporariamente indisponível'],
    ['permissão', { response: { status: 403 } }, 'não tem permissão'],
    ['sessão', { response: { status: 401 } }, 'sessão expirou'],
  ])('mantém o formulário bloqueado após erro de %s e permite tentar novamente', async (_label, error, expected) => {
    getMyProviderProfile.mockRejectedValueOnce(error).mockResolvedValueOnce(null)
    renderDashboard()

    expect((await screen.findByRole('alert')).textContent).toContain(expected)
    expect(screen.queryByRole('form')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('button', { name: 'Publicar anúncio' })).not.toBeNull()
    expect(getMyProviderProfile).toHaveBeenCalledTimes(2)
  })

  it('não tenta atualizar o perfil quando a publicação do anúncio falha', async () => {
    const updateProfile = vi.fn().mockResolvedValue(user)
    useAuth.mockReturnValue({ user, updateProfile })
    saveProviderAd.mockRejectedValueOnce({ response: { status: 503 } })
    renderDashboard()
    await screen.findByRole('button', { name: 'Publicar anúncio' })
    fillAdForm()

    await submitAd()

    expect((await screen.findByRole('alert')).textContent).toContain('temporariamente indisponível')
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('informa sucesso somente depois que anúncio e apresentação da conta forem salvos', async () => {
    const updateProfile = vi.fn().mockResolvedValue(user)
    useAuth.mockReturnValue({ user, updateProfile })
    renderDashboard()
    await screen.findByRole('button', { name: 'Publicar anúncio' })
    fillAdForm()

    await submitAd()

    expect(await screen.findByText(/Anúncio e apresentação da conta salvos/)).not.toBeNull()
    expect(saveProviderAd).toHaveBeenCalledWith({
      specialty: 'Eletricista',
      summary: 'Instalações residenciais',
      categories: ['eletrica'],
      neighborhoods: ['Centro'],
      services: [{ name: 'Instalar luminária', priceFrom: 95 }],
    })
    expect(updateProfile).toHaveBeenCalledWith({
      name: user.name,
      city: user.city,
      region: user.region,
      bio: 'Experiência com instalações residenciais.',
    })
    expect(screen.queryByText(/deste navegador/)).toBeNull()
  })

  it('comunica sucesso parcial e repete só a atualização do perfil se o anúncio não mudou', async () => {
    const updateProfile = vi.fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(user)
    useAuth.mockReturnValue({ user, updateProfile })
    renderDashboard()
    await screen.findByRole('button', { name: 'Publicar anúncio' })
    fillAdForm()

    await submitAd()
    expect((await screen.findByRole('alert')).textContent).toContain('Seu anúncio foi salvo, mas a apresentação da conta não foi atualizada')
    expect(saveProviderAd).toHaveBeenCalledTimes(1)

    await submitAd()
    expect(await screen.findByText(/Anúncio e apresentação da conta salvos/)).not.toBeNull()
    expect(saveProviderAd).toHaveBeenCalledTimes(1)
    expect(updateProfile).toHaveBeenCalledTimes(2)
  })
})
