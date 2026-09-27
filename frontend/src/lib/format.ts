// Formatea un precio (CLP, sin decimales) usando el locale chileno.
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price)
}
