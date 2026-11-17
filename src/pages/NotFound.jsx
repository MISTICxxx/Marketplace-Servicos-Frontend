import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="not-found page-container" aria-labelledby="not-found-title">
      <p className="eyebrow">Erro 404</p>
      <h1 id="not-found-title">Não encontramos esta página.</h1>
      <p>Confira o endereço ou volte ao início para continuar encontrando serviços.</p>
      <Link className="button button--primary" to="/">Voltar ao início</Link>
    </section>
  )
}

export default NotFound
