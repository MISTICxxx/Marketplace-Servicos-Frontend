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

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const returnPath = getAccountReturnPath(location.state?.from)

  function validate() {
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Informe seu e-mail.'
    else if (!isValidEmail(email)) nextErrors.email = 'Informe um e-mail em formato válido.'
    if (!password) nextErrors.password = 'Informe sua senha.'
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      const account = await login({ email, password })
      navigate(account.role === 'provider' ? '/painel-prestador' : returnPath, { replace: true, state: { notice: 'Acesso realizado.' } })
    } catch (error) {
      setFormError(error.response?.data?.error || error.message || 'Não foi possível entrar na sua conta.')
      setIsSubmitting(false)
    }
  }

  return (
    <AccountPageLayout
      description="Acesse seu espaço pessoal no Fechou!."
      title="Entre para continuar."
    >
      <section aria-labelledby="login-form-title" className="account-form-card">
        <p className="eyebrow">Acesso à conta</p>
        <h2 id="login-form-title">Entrar</h2>
        <p className="account-form-description">Entre com o e-mail e a senha da sua conta.</p>
        {formError && <p className="form-message form-message--error" role="alert">{formError}</p>}

        <form aria-busy={isSubmitting} noValidate onSubmit={handleSubmit}>
          <FormField error={errors.email} id="login-email" label="E-mail">
            <input
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              onChange={(event) => {
                setEmail(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, email: undefined }))
                setFormError('')
              }}
              type="email"
              value={email}
            />
          </FormField>
          <FormField
            error={errors.password}
            hint="Informe a senha cadastrada na sua conta."
            id="login-password"
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
              autoComplete="current-password"
              onChange={(event) => {
                setPassword(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, password: undefined }))
                setFormError('')
              }}
              type={passwordVisible ? 'text' : 'password'}
              value={password}
            />
          </FormField>

          <div className="form-utility-row">
            <Link
              className="text-link"
              state={location.state?.from ? { from: location.state.from } : undefined}
              to="/recuperar-senha"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Button className="account-submit" disabled={isSubmitting} type="submit">
            {isSubmitting && <LoadingSpinner label="Entrando na sua conta" />}
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="account-switch">
          Ainda não tem conta?{' '}
          <Link
            className="text-link"
            state={location.state?.from ? { from: location.state.from } : undefined}
            to="/cadastro"
          >
            Criar conta
          </Link>
        </p>
      </section>
    </AccountPageLayout>
  )
}

export default LoginPage
