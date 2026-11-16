import APITest from '../components/APITest.jsx'

function ApiDiagnosticPage() {
  return (
    <section className="page-section page-container">
      <header className="page-heading">
        <p className="eyebrow">Integração</p>
        <h1>Diagnóstico da API</h1>
        <p>Verifique a conexão do frontend com o endpoint de saúde. A API está conectada ao frontend e ao banco MySQL.</p>
      </header>
      <APITest />
    </section>
  )
}

export default ApiDiagnosticPage
