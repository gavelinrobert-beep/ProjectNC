export default function Card({
  children,
  className = '',
  padding = true,
  hover = false,
  onClick = null
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow ${padding ? 'p-6' : ''} ${
        hover ? 'hover:shadow-lg transition-shadow' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}