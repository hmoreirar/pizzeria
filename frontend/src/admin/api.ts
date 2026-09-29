import { clearToken, getToken, setToken } from './auth'
import type {
  DashboardStats,
  OrderSummary,
  Order,
  OrderStatus,
  Product,
  Category,
  AdminOptionGroup,
  ProductInput,
  CategoryInput,
  OptionGroupInput,
  OptionInput,
} from '../types'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body) headers.set('Content-Type', 'application/json')

  const res = await fetch(path, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/admin/login'
    throw new Error('Sesión expirada')
  }
  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // sin JSON; usamos el mensaje genérico
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    let message = 'Credenciales inválidas'
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // sin JSON
    }
    throw new Error(message)
  }
  const data = (await res.json()) as { token: string }
  setToken(data.token)
}

export const getDashboard = () => request<DashboardStats>('/api/admin/dashboard')
export const getAdminOrders = () => request<OrderSummary[]>('/api/admin/orders')
export const getAdminOrder = (id: number) => request<Order>(`/api/admin/orders/${id}`)
export const updateOrderStatus = (id: number, status: OrderStatus) =>
  request<Order>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const getAdminProducts = () => request<Product[]>('/api/admin/products')
export const getAdminProduct = (id: number) => request<Product>(`/api/admin/products/${id}`)
export const createProduct = (input: ProductInput) =>
  request<{ id: number }>('/api/admin/products', { method: 'POST', body: JSON.stringify(input) })
export const updateProduct = (id: number, input: ProductInput) =>
  request<{ id: number }>(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

export const getAdminCategories = () => request<Category[]>('/api/admin/categories')
export const createCategory = (input: CategoryInput) =>
  request<{ id: number }>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  })
export const updateCategory = (id: number, input: CategoryInput) =>
  request<{ id: number }>(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

export const getOptionGroups = (productId: number) =>
  request<AdminOptionGroup[]>(`/api/admin/products/${productId}/option-groups`)
export const createOptionGroup = (productId: number, input: OptionGroupInput) =>
  request<{ id: number }>(`/api/admin/products/${productId}/option-groups`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
export const updateOptionGroup = (id: number, input: OptionGroupInput) =>
  request<{ id: number }>(`/api/admin/products/option-groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
export const deleteOptionGroup = (id: number) =>
  request<void>(`/api/admin/products/option-groups/${id}`, { method: 'DELETE' })
export const createOption = (groupId: number, input: OptionInput) =>
  request<{ id: number }>(`/api/admin/products/option-groups/${groupId}/options`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
export const updateOption = (id: number, input: OptionInput) =>
  request<{ id: number }>(`/api/admin/products/options/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
export const deleteOption = (id: number) =>
  request<void>(`/api/admin/products/options/${id}`, { method: 'DELETE' })
