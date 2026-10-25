import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import useLogout from '../auth/useLogout.js'
import FormField from '../components/account/FormField.jsx'
import Button from '../components/common/Button.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { getInitials } from '../utils/accountNavigation.js'

function MyAccountPage() {
  const { user, updateProfile } = useAuth()
  const logoutAndReturnHome = useLogout()
  const location = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [values, setValues] = useState(() => getEditableFields(user))
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(location.state?.notice ?? '')
  const [formError, setFormError] = useState('')

  function updateValue(field, value) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }))
    setFormError('')
  }

  function startEditing() {
    setValues(getEditableFields(user))
    setErrors({})
    setFormError('')
    setFeedback('')
    setIsEditing(true)
  }

  function cancelEditing() {
    setValues(getEditableFields(user))
    setErrors({})
    setFormError('')
    setIsEditing(false)
  }

  function handleSave(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Informe um nome de exibição.'
    setErrors(nextErrors)
    setFeedback('')
    if (Object.keys(nextErrors).length) return

    setIsSaving(true)
    try {
      const savedUser = updateProfile(values)
      setValues(getEditableFields(savedUser))
      setIsEditing(false)
      setFeedback('Alterações salvas neste navegador.')
    } catch (error) {
      setFormError(error.message || 'Não foi possível salvar as alterações locais.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleLogout() {
    logoutAndReturnHome()
  }

  return (
    <section className="personal-account page-container page-section" aria-labelledby="personal-account-title">
      <header className="page-heading personal-account-heading">
        <p className="eyebrow">Minha conta · dados locais</p>
        <h1 id="personal-account-title">Seu perfil no Fechou!</h1>
        <p>Confira seus dados de apresentação. Este perfil pessoal não configura serviços profissionais nesta etapa.</p>
      </header>

      <div className="personal-account-layout">
        <section className="personal-profile-card" aria-labelledby="personal-profile-heading">
          <div className="personal-profile-heading">
            <span aria-label={`Avatar de ${user.name}`} className="personal-avatar" role="img">
              {getInitials(user.name)}
            </span>
            <div>
              <p className="account-receipt-label">PERFIL PESSOAL</p>
              <h2 id="personal-profile-heading">{user.name}</h2>
              <p className="personal-email">{user.email}</p>
            </div>
          </div>

          {feedback && <p className="form-message form-message--info" role="status">{feedback}</p>}
          {formError && <p className="form-message form-message--error" role="alert">{formError}</p>}

          {isEditing ? (
            <form aria-busy={isSaving} className="profile-edit-form" noValidate onSubmit={handleSave}>
              <FormField error={errors.name} id="profile-name" label="Nome de exibição">
                <input
                  autoComplete="name"
                  onChange={(event) => updateValue('name', event.target.value)}
                  type="text"
                  value={values.name}
                />
              </FormField>
              <div className="profile-edit-location">
                <FormField id="profile-city" label="Cidade" required={false}>
                  <input autoComplete="address-level2" onChange={(event) => updateValue('city', event.target.value)} type="text" value={values.city} />
                </FormField>
                <FormField id="profile-region" label="Estado ou região" required={false}>
                  <input onChange={(event) => updateValue('region', event.target.value)} type="text" value={values.region} />
                </FormField>
              </div>
              <FormField hint="Opcional · até 300 caracteres." id="profile-bio" label="Sobre você" required={false}>
                <textarea maxLength={300} onChange={(event) => updateValue('bio', event.target.value)} rows="4" value={values.bio} />
              </FormField>
              <p className="profile-readonly-email"><span>E-mail da conta</span><strong>{user.email}</strong><small>A confirmação de e-mail estará disponível em uma versão conectada.</small></p>
              <div className="profile-edit-actions">
                <Button disabled={isSaving} type="submit">
                  {isSaving && <LoadingSpinner label="Salvando perfil local" />}
                  {isSaving ? 'Salvando…' : 'Salvar alterações'}
                </Button>
                <Button disabled={isSaving} onClick={cancelEditing} variant="secondary">Cancelar</Button>
              </div>
            </form>
          ) : (
            <>
              <dl className="personal-profile-details">
                <div><dt>E-mail da conta</dt><dd>{user.email}</dd></div>
                <div><dt>Cidade</dt><dd>{user.city || 'Ainda não informado'}</dd></div>
                <div><dt>Estado ou região</dt><dd>{user.region || 'Ainda não informado'}</dd></div>
                <div className="personal-bio-row"><dt>Sobre você</dt><dd>{user.bio || 'Você ainda não adicionou uma apresentação.'}</dd></div>
              </dl>
              <div className="personal-profile-actions">
                <Button onClick={startEditing}>Editar perfil</Button>
                <Button onClick={handleLogout} variant="secondary">Sair da conta</Button>
              </div>
            </>
          )}
        </section>

        <aside className="account-local-note" aria-label="Sobre seus dados de conta">
          <p className="account-receipt-label">ARMAZENAMENTO LOCAL</p>
          <h2>Seus dados, neste navegador.</h2>
          <p>A sessão permanece aberta enquanto esta aba estiver ativa. Você pode encerrá-la pelo menu ou pelo botão de sair.</p>
          <p>Autenticação e proteção de dados dependem da conexão com o servidor.</p>
        </aside>
      </div>
    </section>
  )
}

function getEditableFields(user) {
  return {
    name: user?.name ?? '',
    city: user?.city ?? '',
    region: user?.region ?? '',
    bio: user?.bio ?? '',
  }
}

export default MyAccountPage
