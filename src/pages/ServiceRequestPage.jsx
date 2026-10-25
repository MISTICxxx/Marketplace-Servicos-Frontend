import { Link } from 'react-router-dom'
import RequestForm from '../components/requests/RequestForm.jsx'

function ServiceRequestPage() {
  return (
    <section className="page-section page-container request-page">
      <header className="page-heading request-page-heading">
        <p className="eyebrow">Novo pedido</p>
        <h1>Vamos explicar o que você precisa.</h1>
        <p>Descreva o serviço no seu ritmo. Você poderá revisar tudo antes de registrar.</p>
      </header>
      <RequestForm />
      <p className="request-back-link"><Link className="text-link" to="/servicos">Voltar ao diretório</Link></p>
    </section>
  )
}

export default ServiceRequestPage
