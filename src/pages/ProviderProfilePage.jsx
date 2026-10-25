import { Link, useParams, useSearchParams } from 'react-router-dom'
import ProviderAvatar from '../components/ProviderAvatar.jsx'
import Card from '../components/common/Card.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'
import { getProviderById, getServiceCategories } from '../services/providerService.js'

const categoriesById = new Map(
  getServiceCategories().map((category) => [category.id, category.name]),
)

function getDirectoryReturnPath(requestedPath) {
  const pathname = requestedPath?.split('?')[0]
  return pathname === '/servicos' ? requestedPath : '/servicos'
}

function ProviderProfilePage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const provider = getProviderById(id)

  if (!provider) {
    return (
      <section className="page-container profile-missing" aria-labelledby="profile-missing-title">
        <span className="eyebrow">Perfil indisponível</span>
        <h1 id="profile-missing-title">Não encontramos esse prestador.</h1>
        <p>Confira o endereço ou volte ao diretório para explorar outros perfis.</p>
        <Link className="button button--primary" to="/servicos">Voltar ao diretório</Link>
      </section>
    )
  }

  const returnPath = getDirectoryReturnPath(searchParams.get('voltar'))

  return (
    <article className="page-section page-container provider-profile">
      <nav className="profile-breadcrumb" aria-label="Navegação do perfil">
        <Link to={returnPath}>← Voltar aos resultados</Link>
        <Link to="/servicos">Ver todos os prestadores <span aria-hidden="true">→</span></Link>
      </nav>

      <header className="profile-hero">
        <ProviderAvatar
          category={provider.categories[0]}
          name={provider.name}
          size="large"
        />
        <div className="profile-identity">
          <p className="eyebrow">Perfil de exemplo · Curitiba, PR</p>
          <h1>{provider.name}</h1>
          <p className="profile-specialty">{provider.specialty}</p>
        </div>
      </header>

      <div className="profile-layout">
        <div className="profile-main-column">
          <Card className="profile-content-card">
            <p className="eyebrow">Apresentação</p>
            <h2>Sobre {provider.name.split(' ')[0]}</h2>
            <p className="profile-bio">{provider.bio}</p>
          </Card>

          <Card className="profile-content-card">
            <p className="eyebrow">O que oferece</p>
            <h2>Serviços</h2>
            <ul className="profile-services-list">
              {provider.services.map((service) => (
                <li key={service.name}>
                  <span>{service.name}</span>
                </li>
              ))}
            </ul>
            <ul className="provider-tags profile-tags" aria-label="Categorias de serviço">
              {provider.categories.map((categoryId) => (
                <li className="provider-tag" key={categoryId}>{categoriesById.get(categoryId)}</li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="profile-sidebar" aria-label="Informações do prestador">
          <Card className="receipt-card">
            <div className="receipt-card-heading">
              <div>
                <p className="receipt-kicker">VALORES · REFERÊNCIA</p>
                <h2>Valores de referência</h2>
              </div>
              <span className="receipt-mark" aria-hidden="true">f!</span>
            </div>
            <ul className="receipt-items">
              {provider.services.map((service) => (
                <li key={service.name}>
                  <span>{service.name}<small>A partir de</small></span>
                  <strong>{formatCurrency(service.priceFrom)}</strong>
                </li>
              ))}
            </ul>
            <p className="receipt-footnote">Valores ilustrativos, sujeitos a confirmação. Não são um orçamento.</p>
          </Card>

          <Card className="profile-coverage-card">
            <p className="eyebrow">Curitiba · PR</p>
            <h2>Regiões de atendimento</h2>
            <ul className="neighborhood-list">
              {provider.neighborhoods.map((neighborhood) => (
                <li key={neighborhood}>{neighborhood}</li>
              ))}
            </ul>
          </Card>

          <Card className="profile-action-card">
            <h2>Converse sobre um pedido</h2>
            <p>Escolha um pedido aberto para contextualizar a conversa.</p>
            <Link
              className="button button--primary profile-request-button"
              to={`/conversas?prestador=${encodeURIComponent(provider.id)}`}
            >
              Iniciar conversa
            </Link>
            <p className="planned-feature-note">Precisa registrar um serviço primeiro?</p>
            <Link className="button button--secondary profile-request-button" to="/solicitar-servico">Criar solicitação</Link>
          </Card>
        </aside>
      </div>
    </article>
  )
}

export default ProviderProfilePage
