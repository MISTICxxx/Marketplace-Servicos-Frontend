import Button from './common/Button.jsx'

function ProviderSearch({
  buttonLabel = 'Buscar',
  className = '',
  inputId = 'provider-search',
  label = 'O que você precisa resolver?',
  onChange,
  onSubmit,
  placeholder = 'Ex.: instalar um chuveiro',
  value,
}) {
  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(value)
  }

  return (
    <form
      className={`provider-search ${className}`.trim()}
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="search-label" htmlFor={inputId}>{label}</label>
      <div className="search-control">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          autoComplete="off"
          id={inputId}
          name="q"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="search"
          value={value}
        />
        <Button type="submit">{buttonLabel}</Button>
      </div>
    </form>
  )
}

export default ProviderSearch
