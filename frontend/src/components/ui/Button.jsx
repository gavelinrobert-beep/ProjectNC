import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../shared/constants/design'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  icon = null,
  ...props
}) {
  const baseStyles = 'font-semibold rounded-lg transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2'
  const variantClasses = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary
  const sizeClasses = BUTTON_SIZES[size] || BUTTON_SIZES.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantClasses} ${sizeClasses} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}