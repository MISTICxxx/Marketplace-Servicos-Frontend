import { Link } from 'react-router-dom'
import Card from '../components/common/Card.jsx'

const exampleCategories = [
  { icon: '⌂', name: 'Reparos', description: 'Exemplo de categoria para serviços residenciais.' },
  { icon: '✳', name: 'Aulas', description: 'Exemplo de categoria para ensino e aprendizado.' },
  { icon: '♡', name: 'Cuidados', description: 'Exemplo de categoria para apoio e bem-estar.' },
  { icon: '⌘', name: 'Tecnologia', description: 'Exemplo de categoria para suporte técnico.' },
]

const productSteps = [
  { number: '01', title: 'Descubra', description: 'Explore prestadores por tipo de serviço e conheça o que cada perfil oferece.' },
  { number: '02', title: 'Converse', description: 'Explique o que precisa e mantenha a comunicação ligada à solicitação.' },
  { number: '03', title: 'Compare', description: 'Avalie propostas recebidas para decidir como seguir com o serviço.' },
]

function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Serviços mais perto de você</p>
            <h1 className="hero-title" id="home-title">
              Precisa de ajuda? <span>Fechou!</span>
            </h1>
            <p className="hero-description">
              Uma ideia de marketplace para encontrar profissionais, explicar o que você precisa e aproximar conversas e propostas em um só lugar.
            </p>
            <div className="hero-actions">
              <Link className="button button--primary" to="/servicos">Conheça os serviços</Link>
              <Link className="button button--secondary" to="/sobre">Saiba mais</Link>
            </div>
            <p className="hero-note">Prévia inicial do produto. O diretório ainda está sendo preparado.</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-note-card">
              <p className="card-label">Uma boa combinação começa</p>
              <p className="card-title">com uma conversa.</p>
              <p className="card-detail">Conte o que você precisa. O Fechou! aproxima os próximos passos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block page-container" aria-labelledby="categories-title">
        <div className="section-heading">
          <p className="eyebrow">Um ponto de partida</p>
          <h2 id="categories-title">Que tipo de serviço você procura?</h2>
          <p>Estas categorias são exemplos para orientar a estrutura inicial. A busca por prestadores será construída em uma próxima etapa.</p>
        </div>
        <div className="card-grid card-grid--categories">
          {exampleCategories.map((category) => (
            <Card className="category-card" key={category.name}>
              <span className="category-icon" aria-hidden="true">{category.icon}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-block feature-section" aria-labelledby="steps-title">
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">A proposta</p>
            <h2 id="steps-title">Do primeiro contato à escolha</h2>
            <p>O Fechou! está sendo organizado para apoiar cada etapa da contratação de serviços.</p>
          </div>
          <div className="card-grid card-grid--features">
            {productSteps.map((step) => (
              <Card className="feature-card" key={step.number}>
                <span className="feature-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
