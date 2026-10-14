import i18n from '../i18n'

// CLP has no decimals. Spanish renders the local convention ($12.900),
// English keeps the ISO code (CLP 12,900).
function currentLocale(): string {
  return i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'es-CL'
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat(currentLocale(), {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price)
}

// "From CLP 8,900" for configurable products (base price is the minimum).
export function formatFromPrice(price: number): string {
  return i18n.t('common.from', { price: formatPrice(price) })
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString(currentLocale())
}
