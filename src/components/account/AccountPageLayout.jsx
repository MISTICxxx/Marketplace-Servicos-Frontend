function AccountPageLayout({ children, description, title }) {
  return (
    <section className="account-page page-container" aria-labelledby="account-page-title">
      <header className="account-intro">
        <p className="eyebrow">Fechou! · espaço da conta</p>
        <span className="account-ticket-mark" aria-hidden="true">CONTA <strong>LOCAL</strong></span>
        <h1 id="account-page-title">{title}</h1>
        <p className="account-intro-copy">{description}</p>
        <div className="account-receipt-note">
          <span className="account-receipt-label">CONTA PESSOAL</span>
          <strong>NESTE NAVEGADOR</strong>
        </div>
      </header>
      <div className="account-form-panel">{children}</div>
    </section>
  )
}

export default AccountPageLayout
