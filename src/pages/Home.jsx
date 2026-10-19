import { useState } from 'react'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import DemoNotice from '../components/DemoNotice.jsx'
import ProviderCard from '../components/ProviderCard.jsx'
import ProviderSearch from '../components/ProviderSearch.jsx'
import Card from '../components/common/Card.jsx'
import serviceCategories from '../data/serviceCategories.js'
import { getProviders } from '../services/providerService.js'

const featuredProviders = getProviders().slice(0, 4)

const steps = [
  {
    number: '01',
    title: 'Encontre um prestador',
    description: 'Pesquise por serviço ou explore uma categoria para começar.',
  },
  {
    number: '02',
    title: 'Conheça o perfil',
    description: 'Veja a apresentação, os serviços e a região de atendimento.',
  },
  {
    number: '03',
    title: 'Combine os próximos passos',
    description: 'Solicitações e conversas serão habilitadas em uma próxima etapa.',
    planned: true,
  },
]

function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  function handleSearch(value) {
    const query = value.trim()
    const search = query ? `?${createSearchParams({ q: query })}` : ''
    navigate(`/servicos${search}`)
  }

  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Fechou! · serviços em Curitiba</p>
            <h1 className="hero-title" id="home-title">
              Encontre quem <span>resolve.</span>
            </h1>
            <p className="hero-description">
              Pesquise um serviço, explore prestadores demonstrativos e conheça cada perfil para descobrir o próximo passo.
            </p>
            <ProviderSearch
              buttonLabel="Buscar"
              className="provider-search--hero"
              inputId="home-provider-search"
              label="O que você precisa resolver?"
              onChange={setSearchTerm}
              onSubmit={handleSearch}
              value={searchTerm}
            />
            <Link className="hero-text-link" to="/servicos">
              Explorar todos os prestadores <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <span className="hero-visual-stamp">Curitiba · PR</span>
            <div className="hero-orbit hero-orbit--outer" aria-hidden="true" />
            <div className="hero-orbit hero-orbit--inner" aria-hidden="true" />
            <div className="hero-ticket">
              <span className="ticket-kicker">Fechou! recomenda</span>
              <strong>Um bom começo é saber o que você precisa.</strong>
              <span className="ticket-rule" aria-hidden="true" />
              <span className="ticket-meta">PERFIS ILUSTRATIVOS</span>
            </div>
            <span className="hero-float hero-float--electric">Elétrica</span>
            <span className="hero-float hero-float--home">Casa em ordem</span>
          </div>
        </div>
      </section>

      <div className="page-container demo-intro"><DemoNotice /></div>

      <section className="section-block page-container" aria-labelledby="categories-title">
        <div className="section-heading section-heading--row">
          <div>
            <p className="eyebrow">Explore por categoria</p>
            <h2 id="categories-title">Que serviço você procura?</h2>
          </div>
          <Link className="section-link" to="/servicos">Ver diretório <span aria-hidden="true">→</span></Link>
        </div>
        <div className="category-grid">
          {serviceCategories.map((category) => (
            <Link
              className="category-link"
              key={category.id}
              to={`/servicos?${createSearchParams({ categoria: category.id })}`}
            >
              <span className="category-icon" aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
              <span className="category-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block featured-section" aria-labelledby="featured-title">
        <div className="page-container">
          <div className="section-heading section-heading--row">
            <div>
              <p className="eyebrow">Uma amostra do diretório</p>
              <h2 id="featured-title">Prestadores em destaque</h2>
              <p>Conheça alguns dos perfis fictícios preparados para esta demonstração.</p>
            </div>
            <Link className="section-link" to="/servicos">Ver todos <span aria-hidden="true">→</span></Link>
          </div>
          <div className="provider-grid provider-grid--featured">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-block page-container" aria-labelledby="how-title">
        <div className="section-heading">
          <p className="eyebrow">Uma jornada simples</p>
          <h2 id="how-title">Do que você precisa ao próximo passo</h2>
          <p>Explore e conheça os perfis hoje. A conversa e o pedido de serviço virão em uma etapa futura.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <Card className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              {step.planned && <span className="planned-label">Próxima etapa</span>}
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
