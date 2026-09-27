import type { Category, Product } from './types'

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error ${res.status} al pedir ${url}`)
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
