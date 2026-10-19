import { Link } from 'react-router-dom'
import { getServiceCategories } from '../services/providerService.js'
import Card from './common/Card.jsx'
import ProviderAvatar from './ProviderAvatar.jsx'

const categoryNames = new Map(
  getServiceCategories().map((category) => [category.id, category.name]),
)

function ProviderCard({ provider, returnTo = '/servicos' }) {
  const profileQuery = new URLSearchParams({ voltar: returnTo })
  const profilePath = `/prestadores/${provider.id}?${profileQuery.toString()}`

  return (
    <Card className="provider-card">
      <div className="provider-card-heading">
        <ProviderAvatar
          category={provider.categories[0]}
          name={provider.name}
        />
        <div className="provider-card-name">
          <p className="provider-specialty">{provider.specialty}</p>
          <h3>{provider.name}</h3>
        </div>
      </div>

      <p className="provider-summary">{provider.summary}</p>

      <ul className="provider-tags" aria-label="Categorias de serviço">
        {provider.categories.slice(0, 2).map((categoryId) => (
          <li className="provider-tag" key={categoryId}>
            {categoryNames.get(categoryId)}
          </li>
        ))}
      </ul>

      <div className="provider-card-details">
        <p>
          <span className="detail-label">Atende em</span>
          <span>{provider.neighborhoods.slice(0, 2).join(' · ')}</span>
        </p>
        <p className="demo-rating">
          <span aria-hidden="true">★</span>
          {provider.illustrativeRating.average.toFixed(1)}
          <span>avaliação ilustrativa</span>
        </p>
      </div>

      <Link className="provider-card-link" to={profilePath}>
        Ver perfil <span aria-hidden="true">↗</span>
      </Link>
    </Card>
  )
}

export default ProviderCard
