import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import Button from '../components/common/Button.jsx'
import { getMyProviderProfile, getServiceCategories, saveProviderAd } from '../services/providerService.js'
import { getInitials } from '../utils/accountNavigation.js'

function createAdValues(provider, user) {
  return {
    specialty: provider?.specialty ?? '',
    category: provider?.categories?.[0] ?? '',
    summary: provider?.summary ?? '',
    bio: provider?.bio ?? user.bio ?? '',
    neighborhoods: provider?.neighborhoods?.join(', ') ?? user.city ?? '',
    services: provider?.services?.map((service) => `${service.name} | ${service.priceFrom}`).join('\n') ?? '',
  }
}

function hasSavedAdContent(provider) {
  return Boolean(provider?.specialty?.trim()
    || provider?.summary?.trim()
    || provider?.categories?.length
    || provider?.neighborhoods?.length
    || provider?.services?.length)
}

function getApiFailureMessage(error, fallback) {
  const status = error.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente para continuar.'
  if (status === 403) return 'Sua conta não tem permissão para realizar esta operação.'
  if (!error.response) return 'Não foi possível conectar à API. Verifique a conexão e tente novamente.'
  if (status >= 500) return 'O serviço está temporariamente indisponível. Tente novamente.'
  return fallback
}

function createAdPayload(values) {
  const services = values.services.split('\n').map((line) => {
    const [name, price] = line.split('|')
    return { name: name?.trim(), priceFrom: Number(String(price ?? '').replace(',', '.')) || 0 }
  }).filter((service) => service.name)

  return {
    specialty: values.specialty,
    summary: values.summary,
    categories: values.category ? [values.category] : [],
    neighborhoods: values.neighborhoods.split(',').map((item) => item.trim()).filter(Boolean),
    services,
  }
}

function ProviderDashboardPage() {
  const { user, updateProfile } = useAuth()
  const [adState, setAdState] = useState({ status: 'loading', provider: null, error: '' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const categories = getServiceCategories()
  const [feedback, setFeedback] = useState(null)
  const [values, setValues] = useState(() => createAdValues(null, user))
  const [isSaving, setIsSaving] = useState(false)
  const [pendingProfileUpdate, setPendingProfileUpdate] = useState(false)
  const [savedAdDraftKey, setSavedAdDraftKey] = useState('')
  const existingAd = adState.provider
  const hasAdContent = hasSavedAdContent(existingAd)
  const isUnpublishedProfile = Boolean(existingAd && !existingAd.active && !hasAdContent)
  const userId = user.id

  useEffect(() => {
    let active = true
    getMyProviderProfile().then((provider) => {
      if (!active) return
      if (provider) setValues(createAdValues(provider, {}))
      setAdState({ status: 'ready', provider, error: '' })
    }).catch((error) => {
      if (!active) return
      setAdState({
        status: 'error',
        provider: null,
        error: getApiFailureMessage(error, 'Não foi possível carregar seu anúncio.'),
      })
    })
    return () => { active = false }
  }, [loadAttempt, userId])

  function retryAdLoad() {
    setFeedback(null)
    setAdState({ status: 'loading', provider: null, error: '' })
    setLoadAttempt((current) => current + 1)
  }

  const hasLocation = Boolean(values.neighborhoods.trim())
  const profileSteps = [
    { label: 'Nome profissional', complete: Boolean(user.name?.trim()) },
    { label: 'Cidade e região', complete: hasLocation },
    { label: 'Apresentação', complete: Boolean(user.bio?.trim()) },
  ]
  const completedSteps = profileSteps.filter(({ complete }) => complete).length

  async function handleSaveAd(event) {
    event.preventDefault()
    setIsSaving(true)
    setFeedback(null)
    const adPayload = createAdPayload(values)
    const draftKey = JSON.stringify(adPayload)
    const retryingProfileOnly = pendingProfileUpdate && draftKey === savedAdDraftKey

    try {
      if (!retryingProfileOnly) {
        const savedAd = await saveProviderAd(adPayload)
        setAdState({ status: 'ready', provider: savedAd, error: '' })
        setSavedAdDraftKey(draftKey)
      }
    } catch (error) {
      const prefix = pendingProfileUpdate
        ? 'O anúncio anteriormente salvo permanece publicado; as alterações mais recentes não foram aplicadas. '
        : ''
      setFeedback({ kind: pendingProfileUpdate ? 'partial' : 'error', message: prefix + getApiFailureMessage(error, 'Não foi possível salvar o anúncio.') })
      setIsSaving(false)
      return
    }

    try {
      await updateProfile({ name: user.name, city: user.city, region: user.region, bio: values.bio })
      setPendingProfileUpdate(false)
      setFeedback({ kind: 'success', message: 'Anúncio e apresentação da conta salvos.' })
    } catch (error) {
      setPendingProfileUpdate(true)
      setFeedback({
        kind: 'partial',
        message: `Seu anúncio foi salvo, mas a apresentação da conta não foi atualizada. ${getApiFailureMessage(error, 'Tente salvar novamente para concluir.')}`,
      })
    } finally {
      setIsSaving(false)
    }
  }

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    if (feedback?.kind === 'error') setFeedback(null)
  }

  return (
    <section className="provider-dashboard page-container page-section" aria-labelledby="provider-dashboard-title">
      <header className="provider-dashboard-heading">
        <div>
          <p className="eyebrow">Área do prestador</p>
          <h1 id="provider-dashboard-title">Seu trabalho começa aqui, {user.name.split(' ')[0]}.</h1>
          <p>Acompanhe sua apresentação profissional e deixe seu perfil pronto para receber novos clientes.</p>
        </div>
        <Link className="button button--primary" to="/minha-conta">Completar meu perfil</Link>
      </header>

      <div className="provider-dashboard-grid">
        <article className="provider-dashboard-card provider-dashboard-profile">
          <div className="provider-dashboard-card-heading">
            <div className="provider-dashboard-avatar" aria-hidden="true">{getInitials(user.name)}</div>
            <div>
              <p className="eyebrow">Sua apresentação</p>
              <h2>{user.name}</h2>
              <p>{[user.city, user.region].filter(Boolean).join(' · ') || 'Adicione sua cidade de atendimento'}</p>
            </div>
          </div>
          <p className="provider-dashboard-bio">{user.bio || 'Conte um pouco sobre sua experiência e os serviços que oferece para ajudar clientes a conhecer seu trabalho.'}</p>
          <div className="provider-dashboard-card-actions">
            <Link className="button button--secondary" to="/minha-conta">Editar apresentação</Link>
            <Link className="text-link" to="/servicos">Explorar o diretório <span aria-hidden="true">→</span></Link>
          </div>
        </article>

        <article className="provider-dashboard-card provider-dashboard-progress">
          <p className="eyebrow">Próximo passo</p>
          <h2>Prepare seu perfil profissional</h2>
          <p className="provider-dashboard-muted">Um perfil completo ajuda as pessoas a entender sua experiência e onde você atende.</p>
          <div className="provider-progress-label"><span>Perfil preenchido</span><strong>{completedSteps} de {profileSteps.length}</strong></div>
          <div className="provider-progress-track" role="progressbar" aria-label="Perfil preenchido" aria-valuemin="0" aria-valuemax={profileSteps.length} aria-valuenow={completedSteps}>
            <span style={{ width: `${(completedSteps / profileSteps.length) * 100}%` }} />
          </div>
          <ul className="provider-profile-checklist">
            {profileSteps.map(({ label, complete }) => (
              <li key={label}><span aria-hidden="true" className={complete ? 'provider-check is-complete' : 'provider-check'}>{complete ? '✓' : '○'}</span>{label}</li>
            ))}
          </ul>
          <Link className="text-link" to="/minha-conta">Atualizar meus dados <span aria-hidden="true">→</span></Link>
        </article>

        <article className="provider-dashboard-card provider-dashboard-inbox">
          <div>
            <p className="eyebrow">Oportunidades</p>
            <h2>Converse com clientes</h2>
            <p className="provider-dashboard-muted">Suas conversas e pedidos ficam reunidos em um só lugar para você acompanhar cada atendimento.</p>
          </div>
          <Link className="button button--primary" to="/conversas">Ver conversas</Link>
        </article>

        <article className="provider-dashboard-card provider-dashboard-ad">
          <p className="eyebrow">Seu anúncio</p>
          <h2>
            {adState.status === 'loading' ? 'Carregando seu anúncio' : adState.status === 'error' ? 'Anúncio indisponível' : existingAd && !isUnpublishedProfile ? 'Edite seu anúncio profissional' : 'Crie seu anúncio profissional'}
          </h2>
          <p className="provider-dashboard-muted">Esse conteúdo aparece para clientes no diretório de serviços.</p>
          {feedback && (
            <p className={`form-message form-message--${feedback.kind === 'success' ? 'info' : 'error'}`} role={feedback.kind === 'success' ? 'status' : 'alert'}>
              {feedback.message}
            </p>
          )}
          {existingAd && (
            <p role="status">
              {existingAd.active
                ? 'Seu anúncio está ativo e visível no diretório.'
                : hasAdContent
                  ? 'Seu anúncio está inativo e não aparece para clientes. Ao salvar, ele será publicado novamente.'
                  : 'Seu perfil ainda não tem um anúncio publicado. Ao salvar, ele ficará visível no diretório.'}
            </p>
          )}
          {adState.status === 'loading' && <p role="status">Carregando seu anúncio…</p>}
          {adState.status === 'error' && (
            <div>
              <p className="form-message form-message--error" role="alert">{adState.error}</p>
              <Button disabled={isSaving} onClick={retryAdLoad} variant="secondary">
                Tentar novamente
              </Button>
            </div>
          )}
          {adState.status === 'ready' && (
            <form aria-busy={isSaving} aria-label="Formulário do anúncio" className="provider-ad-form" onSubmit={handleSaveAd}>
              <label>Especialidade<input disabled={isSaving} required maxLength="90" onChange={(event) => updateValue('specialty', event.target.value)} value={values.specialty} /></label>
              <label>Categoria<select disabled={isSaving} required onChange={(event) => updateValue('category', event.target.value)} value={values.category}><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label>Resumo do anúncio<input disabled={isSaving} required maxLength="140" onChange={(event) => updateValue('summary', event.target.value)} value={values.summary} /></label>
              <label>Apresentação<textarea disabled={isSaving} required maxLength="800" rows="4" onChange={(event) => updateValue('bio', event.target.value)} value={values.bio} /></label>
              <label>Bairros atendidos, separados por vírgula<input disabled={isSaving} required onChange={(event) => updateValue('neighborhoods', event.target.value)} value={values.neighborhoods} /></label>
              <label>Serviços e preço inicial, um por linha<textarea disabled={isSaving} placeholder={'Instalar luminária | 95\nTrocar tomada | 70'} rows="4" onChange={(event) => updateValue('services', event.target.value)} value={values.services} /><small>Formato: nome do serviço | valor em reais</small></label>
              <button className="button button--primary" disabled={isSaving} type="submit">{isSaving ? 'Salvando…' : existingAd && !isUnpublishedProfile ? 'Salvar anúncio' : 'Publicar anúncio'}</button>
            </form>
          )}
          {existingAd?.active && <Link className="text-link" to={`/prestadores/${user.id}`}>Ver meu perfil público <span aria-hidden="true">→</span></Link>}
        </article>
      </div>
      <p className="provider-dashboard-note">Seu anúncio profissional e os dados do perfil são salvos na sua conta.</p>
    </section>
  )
}

export default ProviderDashboardPage
