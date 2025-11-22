export function formatCurrency(amount, currency = 'SEK') {
  if (amount == null) return 'N/A'
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function formatNumber(number) {
  if (number == null) return 'N/A'
  return new Intl.NumberFormat('sv-SE').format(number)
}

export function formatPercentage(value, decimals = 1) {
  if (value == null) return 'N/A'
  return `${value.toFixed(decimals)}%`
}

export function formatDistance(meters) {
  if (meters == null) return 'N/A'
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}
