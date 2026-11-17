import Card from '../components/common/Card.jsx'

function AboutPage() {
  return (
    <section className="page-section page-container">
      <header className="page-heading">
        <p className="eyebrow">Sobre o projeto</p>
        <h1>Serviços que aproximam</h1>
        <p>Fechou! conecta pessoas que precisam de um serviço a profissionais locais, com conversa e propostas organizadas antes da contratação.</p>
      </header>

      <div className="about-layout">
        <div className="about-copy">
          <h2>Uma jornada mais clara</h2>
          <p>Encontre perfis por categoria e região, registre o que precisa e converse com profissionais vinculados ao seu pedido.</p>
          <p>Os prestadores podem enviar alternativas e novas versões de orçamento. O cliente compara condições e confirma explicitamente a versão escolhida; o aceite registra uma ordem de serviço sem processar pagamento.</p>
        </div>
        <Card className="about-callout">
          <h2>Estado atual</h2>
          <p>Home, diretório, perfis, conta, pedidos, conversas, orçamentos e ordens de serviço usam a API Node.js e o MySQL local. A demonstração não inclui pagamento e mantém contas separadas entre clientes e prestadores.</p>
        </Card>
      </div>
    </section>
  )
}

export default AboutPage
