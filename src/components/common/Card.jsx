function Card({ as: Element = 'article', children, className = '' }) {
  return <Element className={`card ${className}`.trim()}>{children}</Element>
}

export default Card
