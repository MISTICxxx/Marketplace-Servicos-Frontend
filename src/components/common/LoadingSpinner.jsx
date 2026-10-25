function LoadingSpinner({ label = 'Carregando' }) {
  return (
    <span className="loading-spinner" role="status">
      <span className="visually-hidden">{label}</span>
    </span>
  )
}

export default LoadingSpinner
