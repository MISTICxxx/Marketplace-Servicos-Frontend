function ProviderAvatar({ category, name, size = 'regular' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('pt-BR')

  return (
    <span
      aria-hidden="true"
      className={`provider-avatar provider-avatar--${size}`}
      data-category={category}
    >
      {initials}
    </span>
  )
}

export default ProviderAvatar
