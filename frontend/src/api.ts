import type {
  Category,
  Product,
  ProductDetail,
  Settings,
  Order,
  CreateOrderPayload,
} from './types'

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error ${res.status} al pedir ${url}`)
  }
  return res.json() as Promise<T>
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = `Error ${res.status} al pedir ${url}`
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // respuesta sin JSON; usamos el mensaje genérico
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export function getCategories(): Promise<Category[]> {
  return getJSON<Category[]>('/api/categories')
}

export function getProducts(categoryId?: number): Promise<Product[]> {
  const query = categoryId ? `?category=${categoryId}` : ''
  return getJSON<Product[]>(`/api/products${query}`)
}

export function getProduct(id: number): Promise<ProductDetail> {
  return getJSON<ProductDetail>(`/api/products/${id}`)
}

export function getSettings(): Promise<Settings> {
  return getJSON<Settings>('/api/settings')
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return postJSON<Order>('/api/orders', payload)
}

export function getOrder(id: number): Promise<Order> {
  return getJSON<Order>(`/api/orders/${id}`)
}
