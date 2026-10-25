import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../services/api.js'
import Button from './common/Button.jsx'
import Card from './common/Card.jsx'
import LoadingSpinner from './common/LoadingSpinner.jsx'

function APITest() {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ kind: 'loading', message: '' })

  useEffect(() => {
    const controller = new AbortController()

    async function checkApiHealth() {
      try {
        const response = await api.get('/health', { signal: controller.signal })
        setResult({
          kind: 'success',
          message: `A API respondeu com sucesso (HTTP ${response.status}).`,
        })
      } catch (error) {
        if (axios.isCancel(error)) return

        const message = error.response
          ? `A API respondeu com erro HTTP ${error.response.status}.`
          : error.request
            ? 'Não foi possível conectar à API. Verifique se ela está em execução e tente novamente.'
            : 'Não foi possível iniciar a verificação da API.'

        setResult({ kind: 'error', message })
      }
    }

    checkApiHealth()
    return () => controller.abort()
  }, [attempt])

  return (
    <Card className="diagnostic-card">
      <div className="diagnostic-title-row">
        <div>
          <h2>Conexão com a API</h2>
          <code className="diagnostic-endpoint">
            {api.defaults.baseURL}/health
          </code>
        </div>
        <Button
          disabled={result.kind === 'loading'}
          onClick={() => {
            setResult({ kind: 'loading', message: '' })
            setAttempt((currentAttempt) => currentAttempt + 1)
          }}
          variant="secondary"
        >
          Tentar novamente
        </Button>
      </div>

      {result.kind === 'loading' ? (
        <p className="diagnostic-message" aria-live="polite">
          <LoadingSpinner label="Verificando conexão com a API" />
          <span> Verificando a conexão com /health…</span>
        </p>
      ) : (
        <p
          className={`diagnostic-message diagnostic-message--${result.kind}`}
          role={result.kind === 'error' ? 'alert' : 'status'}
        >
          {result.message}
        </p>
      )}
    </Card>
  )
}

export default APITest
