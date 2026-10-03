// Price formatting (CLP, no decimals) with English locale.
// Option 1: English text, keep Chilean peso amounts.
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price)
}

// "From CLP 8,900" for configurable products (base price is the minimum).
export function formatFromPrice(price: number): string {
  return `From ${formatPrice(price)}`
}
