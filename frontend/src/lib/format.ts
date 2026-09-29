// Formatea un precio (CLP, sin decimales) usando el locale chileno.
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price)
}

// "Desde $8.990" para productos configurables (el precio base es el mínimo).
export function formatFromPrice(price: number): string {
  return `Desde ${formatPrice(price)}`
}
