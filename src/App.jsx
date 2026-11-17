import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import useAuth from './auth/useAuth.js'
import Button from './components/common/Button.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ApiDiagnosticPage from './pages/ApiDiagnosticPage.jsx'
import ConversationInboxPage from './pages/ConversationInboxPage.jsx'
import ConversationPage from './pages/ConversationPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Home from './pages/Home.jsx'
import MyAccountPage from './pages/MyAccountPage.jsx'
import NotFound from './pages/NotFound.jsx'
import ProviderProfilePage from './pages/ProviderProfilePage.jsx'
import ProviderDashboardPage from './pages/ProviderDashboardPage.jsx'
import RecoverPasswordPage from './pages/RecoverPasswordPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ServiceRequestPage from './pages/ServiceRequestPage.jsx'
import MyRequestsPage from './pages/MyRequestsPage.jsx'
import RequestDetailsPage from './pages/RequestDetailsPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import QuoteComparisonPage from './pages/QuoteComparisonPage.jsx'
import ServiceOrdersPage from './pages/ServiceOrdersPage.jsx'
import ServiceOrderDetailsPage from './pages/ServiceOrderDetailsPage.jsx'
import './App.css'

function ProtectedRoute({ children, role }) {
  const { user, loading, retrySession, sessionError } = useAuth()
  const location = useLocation()

  if (loading) return <p className="page-container page-section" role="status">Verificando sua sessão…</p>
  if (sessionError) {
    return (
      <section className="page-container page-section" aria-labelledby="session-error-title">
        <h1 id="session-error-title">Não foi possível validar sua sessão</h1>
        <p role="alert">{sessionError}</p>
        <Button onClick={retrySession} variant="secondary">Tentar novamente</Button>
        <Link className="text-link" to="/entrar">Entrar em outra conta</Link>
      </section>
    )
  }
  if (!user) {
    return <Navigate replace state={{ from: location }} to="/entrar" />
  }

  if (role && (user.role ?? 'customer') !== role) {
    return <Navigate replace to={user.role === 'provider' ? '/painel-prestador' : '/meus-pedidos'} />
  }

  return children
}

function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>
      <Header />
      <main className="app-main" id="conteudo-principal">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/prestadores/:id" element={<ProviderProfilePage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/diagnostico-api" element={<ApiDiagnosticPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />
          <Route
            path="/painel-prestador"
            element={(
              <ProtectedRoute role="provider">
                <ProviderDashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/conversas"
            element={(
              <ProtectedRoute>
                <ConversationInboxPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/conversas/:conversationId"
            element={(
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/solicitar-servico"
            element={(
              <ProtectedRoute role="customer">
                <ServiceRequestPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/meus-pedidos"
            element={(
              <ProtectedRoute role="customer">
                <MyRequestsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/meus-pedidos/:requestId"
            element={(
              <ProtectedRoute role="customer">
                <RequestDetailsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/meus-pedidos/:requestId/orcamentos"
            element={(
              <ProtectedRoute role="customer">
                <QuoteComparisonPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/contratacoes"
            element={(
              <ProtectedRoute>
                <ServiceOrdersPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/contratacoes/:orderId"
            element={(
              <ProtectedRoute>
                <ServiceOrderDetailsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/minha-conta"
            element={(
              <ProtectedRoute>
                <MyAccountPage />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export { ProtectedRoute }
export default App
