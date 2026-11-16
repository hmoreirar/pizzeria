// CLP has no decimals. Spanish uses the local convention ($12.900).
const LOCALE = 'es-CL'

export function formatPrice(price: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price)
}

// "Desde $8.900" for configurable products (base price is the minimum).
export function formatFromPrice(price: number): string {
  return `Desde ${formatPrice(price)}`
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString(LOCALE)
}
