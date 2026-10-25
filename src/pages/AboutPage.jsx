import Card from '../components/common/Card.jsx'

function AboutPage() {
  return (
    <section className="page-section page-container">
      <header className="page-heading">
        <p className="eyebrow">Sobre o projeto</p>
        <h1>Serviços que aproximam</h1>
          <p>Fechou! é um marketplace em construção para facilitar o encontro entre pessoas que precisam de um serviço e profissionais que podem realizá-lo.</p>
      </header>

      <div className="about-layout">
        <div className="about-copy">
          <h2>Uma jornada mais clara</h2>
          <p>A proposta é reunir a descoberta de prestadores, a apresentação de perfis, o envio de solicitações e a comunicação entre consumidores e profissionais.</p>
          <p>Pedidos e mensagens ficam neste navegador e não chegam a profissionais. Mensagens reais, propostas, comparação de orçamentos e contratação dependem das próximas etapas e da API.</p>
        </div>
        <Card className="about-callout">
          <h2>Estado atual</h2>
          <p>Home, diretório, perfis, conta, pedidos e conversas estão disponíveis para explorar. A API será desenvolvida em um repositório separado; pedidos e mensagens não são enviados a profissionais.</p>
        </Card>
      </div>
    </section>
  )
}

export default AboutPage
