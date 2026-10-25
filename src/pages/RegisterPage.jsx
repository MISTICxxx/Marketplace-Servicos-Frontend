import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import AccountPageLayout from '../components/account/AccountPageLayout.jsx'
import FormField from '../components/account/FormField.jsx'
import Button from '../components/common/Button.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { getAccountReturnPath } from '../utils/accountNavigation.js'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function RegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmation: '' })
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmationVisible, setConfirmationVisible] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createAccount } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  function updateValue(field, value) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }))
    setFormError('')
  }

  function validate() {
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Informe como você gostaria de ser chamado.'
    if (!values.email.trim()) nextErrors.email = 'Informe seu e-mail.'
    else if (!isValidEmail(values.email)) nextErrors.email = 'Informe um e-mail em formato válido.'
    if (values.password.length < 8) nextErrors.password = 'Use pelo menos 8 caracteres.'
    if (!values.confirmation) nextErrors.confirmation = 'Repita a senha para confirmar.'
    else if (values.confirmation !== values.password) nextErrors.confirmation = 'As senhas não coincidem.'
    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      createAccount({ name: values.name, email: values.email })
      navigate(getAccountReturnPath(location.state?.from), {
        replace: true,
        state: { notice: 'Perfil criado. A senha não foi armazenada.' },
      })
    } catch (error) {
      const message = error.message || 'Não foi possível criar seu perfil.'
      if (message.startsWith('Já existe')) {
        setErrors((currentErrors) => ({ ...currentErrors, email: message }))
      } else {
        setFormError(message)
      }
      setIsSubmitting(false)
    }
  }

  return (
    <AccountPageLayout
      description="Crie seu perfil para começar a usar o Fechou!."
      title="Um espaço para começar."
    >
      <section aria-labelledby="register-form-title" className="account-form-card">
        <p className="eyebrow">Novo perfil</p>
        <h2 id="register-form-title">Criar conta</h2>
        <p className="account-form-description">Seus dados ficam neste navegador. A senha é descartada após a validação.</p>
        {formError && <p className="form-message form-message--error" role="alert">{formError}</p>}

        <form aria-busy={isSubmitting} noValidate onSubmit={handleSubmit}>
          <FormField error={errors.name} id="register-name" label="Nome de exibição">
            <input
              autoComplete="name"
              onChange={(event) => updateValue('name', event.target.value)}
              type="text"
              value={values.name}
            />
          </FormField>
          <FormField error={errors.email} id="register-email" label="E-mail">
            <input
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              onChange={(event) => updateValue('email', event.target.value)}
              type="email"
              value={values.email}
            />
          </FormField>
          <FormField
            error={errors.password}
            hint="Use 8 caracteres ou mais. A senha é descartada após a validação."
            id="register-password"
            label="Senha"
            suffix={(
              <button
                aria-label={passwordVisible ? 'Ocultar senha' : 'Exibir senha'}
                aria-pressed={passwordVisible}
                className="password-toggle"
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                {passwordVisible ? 'Ocultar' : 'Exibir'}
              </button>
            )}
          >
            <input
              autoComplete="new-password"
              onChange={(event) => updateValue('password', event.target.value)}
              type={passwordVisible ? 'text' : 'password'}
              value={values.password}
            />
          </FormField>
          <FormField
            error={errors.confirmation}
            id="register-confirmation"
            label="Confirme a senha"
            suffix={(
              <button
                aria-label={confirmationVisible ? 'Ocultar confirmação' : 'Exibir confirmação'}
                aria-pressed={confirmationVisible}
                className="password-toggle"
                onClick={() => setConfirmationVisible((visible) => !visible)}
                type="button"
              >
                {confirmationVisible ? 'Ocultar' : 'Exibir'}
              </button>
            )}
          >
            <input
              autoComplete="new-password"
              onChange={(event) => updateValue('confirmation', event.target.value)}
              type={confirmationVisible ? 'text' : 'password'}
              value={values.confirmation}
            />
          </FormField>
          <Button className="account-submit" disabled={isSubmitting} type="submit">
            {isSubmitting && <LoadingSpinner label="Criando perfil local" />}
            {isSubmitting ? 'Criando…' : 'Criar perfil'}
          </Button>
        </form>

        <p className="account-switch">
          Já tem um perfil?{' '}
          <Link
            className="text-link"
            state={location.state?.from ? { from: location.state.from } : undefined}
            to="/entrar"
          >
            Entrar
          </Link>
        </p>
      </section>
    </AccountPageLayout>
  )
}

export default RegisterPage
