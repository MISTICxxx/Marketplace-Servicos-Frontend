import { Link } from 'react-router-dom'
import Card from '../components/common/Card.jsx'

const examples = [
  { title: 'Reparos residenciais', description: 'Exemplo ilustrativo de uma categoria do futuro diretório.' },
  { title: 'Aulas particulares', description: 'Exemplo ilustrativo de uma categoria do futuro diretório.' },
  { title: 'Suporte de tecnologia', description: 'Exemplo ilustrativo de uma categoria do futuro diretório.' },
]

function ServicesPage() {
  return (
    <section className="page-section page-container">
      <header className="page-heading">
        <p className="eyebrow">Diretório</p>
        <h1>Serviços</h1>
        <p>Esta página prepara o espaço onde será possível descobrir prestadores por tipo de serviço.</p>
      </header>

      <Card className="notice-card">
        <span className="status-pill">Planejado para próxima sprint</span>
        <h2>O diretório ainda não está disponível</h2>
        <p>Os cartões abaixo são apenas exemplos de conteúdo. Não representam profissionais cadastrados nem ofertas reais.</p>
      </Card>

      <div className="card-grid card-grid--services service-examples-grid">
        {examples.map((example) => (
          <Card className="service-example" key={example.title}>
            <span className="status-pill">Exemplo</span>
            <h3>{example.title}</h3>
            <p>{example.description}</p>
          </Card>
        ))}
      </div>
      <p className="diagnostic-message">
        Quer conhecer o objetivo do projeto? <Link className="text-link" to="/sobre">Leia sobre o Fechou!</Link>
      </p>
    </section>
  )
}

export default ServicesPage
