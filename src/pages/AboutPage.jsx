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
          <p>Em etapas futuras, o produto poderá apoiar o recebimento e a comparação de orçamentos e a contratação. Esta versão prepara a estrutura do frontend; os fluxos ainda não estão implementados.</p>
        </div>
        <Card className="about-callout">
          <h2>Estado atual</h2>
          <p>Fundação inicial do frontend: navegação, páginas-base e preparação para futura integração com uma API separada.</p>
        </Card>
      </div>
    </section>
  )
}

export default AboutPage
