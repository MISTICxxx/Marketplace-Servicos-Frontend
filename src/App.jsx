import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import useAuth from './auth/useAuth.js'
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
import RecoverPasswordPage from './pages/RecoverPasswordPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ServiceRequestPage from './pages/ServiceRequestPage.jsx'
import MyRequestsPage from './pages/MyRequestsPage.jsx'
import RequestDetailsPage from './pages/RequestDetailsPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import './App.css'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/entrar" />
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
              <ProtectedRoute>
                <ServiceRequestPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/meus-pedidos"
            element={(
              <ProtectedRoute>
                <MyRequestsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/meus-pedidos/:requestId"
            element={(
              <ProtectedRoute>
                <RequestDetailsPage />
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

export default App
