import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ApiDiagnosticPage from './pages/ApiDiagnosticPage.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import './App.css'

function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>
      <Header />
      <main className="app-main" id="conteudo-principal">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/diagnostico-api" element={<ApiDiagnosticPage />} />
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
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
