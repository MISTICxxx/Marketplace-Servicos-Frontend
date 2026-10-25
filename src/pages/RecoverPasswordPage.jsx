import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AccountPageLayout from '../components/account/AccountPageLayout.jsx'
import FormField from '../components/account/FormField.jsx'
import Button from '../components/common/Button.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'

function RecoverPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState('')
  const location = useLocation()

  function handleSubmit(event) {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setError('Informe seu e-mail.')
      setResult('')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Informe um e-mail em formato válido.')
      setResult('')
      return
    }

    setError('')
    setIsSubmitting(true)
    setResult('Não enviamos um e-mail. A recuperação poderá ser concluída quando o serviço estiver disponível.')
    setIsSubmitting(false)
  }

  return (
    <AccountPageLayout
      description="Informe o e-mail associado à sua conta para continuar."
      title="Vamos encontrar o próximo passo."
    >
      <section aria-labelledby="recovery-form-title" className="account-form-card">
        <p className="eyebrow">Acesso à conta</p>
        <h2 id="recovery-form-title">Recuperar senha</h2>
        <p className="account-form-description">O envio de recuperação por e-mail ainda não está disponível.</p>
        {result && <p className="form-message form-message--info" role="status">{result}</p>}

        <form aria-busy={isSubmitting} noValidate onSubmit={handleSubmit}>
          <FormField error={error} id="recovery-email" label="E-mail">
            <input
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
                setResult('')
              }}
              type="email"
              value={email}
            />
          </FormField>
          <Button className="account-submit" disabled={isSubmitting} type="submit">
            {isSubmitting && <LoadingSpinner label="Validando e-mail" />}
            {isSubmitting ? 'Verificando…' : 'Continuar'}
          </Button>
        </form>
        <p className="account-switch">
          <Link
            className="text-link"
            state={location.state?.from ? { from: location.state.from } : undefined}
            to="/entrar"
          >
            ← Voltar ao login
          </Link>
        </p>
      </section>
    </AccountPageLayout>
  )
}

export default RecoverPasswordPage
