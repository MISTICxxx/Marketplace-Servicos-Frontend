import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import DemoNotice from '../components/DemoNotice.jsx'
import ProviderCard from '../components/ProviderCard.jsx'
import ProviderSearch from '../components/ProviderSearch.jsx'
import Button from '../components/common/Button.jsx'
import { getNeighborhoodOptions, getProviders, getServiceCategories } from '../services/providerService.js'

const categories = getServiceCategories()
const neighborhoods = getNeighborhoodOptions()

function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('categoria') ?? ''
  const neighborhood = searchParams.get('bairro') ?? ''

  const providers = useMemo(
    () => getProviders({ query, category, neighborhood }),
    [category, neighborhood, query],
  )

  function updateFilter(name, value) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      if (value) nextParams.set(name, value)
      else nextParams.delete(name)
      return nextParams
    }, { replace: true })
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const hasFilters = Boolean(query || category || neighborhood)
  const resultLabel = `${providers.length} ${providers.length === 1 ? 'prestador' : 'prestadores'} demonstrativo${providers.length === 1 ? '' : 's'}`

  return (
    <section className="page-section page-container directory-page">
      <header className="page-heading directory-heading">
        <p className="eyebrow">Diretório de serviços · Curitiba, PR</p>
        <h1>Encontre o profissional certo.</h1>
        <p>Pesquise pelo serviço ou explore por categoria e bairro. Os perfis desta versão são demonstrativos.</p>
      </header>

      <DemoNotice />

      <div className="directory-search-panel">
        <ProviderSearch
          buttonLabel="Buscar"
          inputId="directory-provider-search"
          label="Pesquise por serviço, profissional ou região"
          onChange={(value) => updateFilter('q', value)}
          onSubmit={(value) => updateFilter('q', value.trim())}
          value={query}
        />

        <fieldset className="directory-filters">
          <legend className="visually-hidden">Filtros do diretório</legend>
          <label className="filter-field" htmlFor="category-filter">
            <span>Categoria</span>
            <select
              id="category-filter"
              onChange={(event) => updateFilter('categoria', event.target.value)}
              value={category}
            >
              <option value="">Todas as categorias</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="filter-field" htmlFor="neighborhood-filter">
            <span>Bairro</span>
            <select
              id="neighborhood-filter"
              onChange={(event) => updateFilter('bairro', event.target.value)}
              value={neighborhood}
            >
              <option value="">Todos os bairros</option>
              {neighborhoods.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          {hasFilters && (
            <Button className="clear-filters-button" onClick={clearFilters} variant="secondary">
              Limpar filtros
            </Button>
          )}
        </fieldset>
      </div>

      <div className="results-heading">
        <h2>Prestadores</h2>
        <p aria-live="polite" aria-atomic="true">{resultLabel}</p>
      </div>

      {providers.length ? (
        <div className="provider-grid">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              returnTo={`${location.pathname}${location.search}`}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <span className="empty-state-mark" aria-hidden="true">⌕</span>
          <h2>Nenhum prestador encontrado</h2>
          <p>Tente outro termo ou remova um dos filtros para ver mais perfis demonstrativos.</p>
          <Button onClick={clearFilters}>Limpar busca e filtros</Button>
        </div>
      )}

      <p className="directory-footnote">
        Quer saber como os perfis são apresentados? <Link className="text-link" to="/sobre">Conheça o Fechou!</Link>
      </p>
    </section>
  )
}

export default ServicesPage
