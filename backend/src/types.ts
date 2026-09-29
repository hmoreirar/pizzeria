// Tipos de dominio compartidos por repositorios y rutas.

export interface Category {
  id: number
  name: string
  active: boolean
  sortOrder: number
}

export interface Product {
  id: number
  categoryId: number
  categoryName: string
  name: string
  description: string | null
  image: string | null
  price: number
  active: boolean
  // Indica si el producto tiene grupos de opciones (requiere configuración).
  configurable: boolean
}

// Una opción dentro de un grupo (ej. "Familiar · 38 cm" con sobreprecio 3000).
export interface ProductOption {
  id: number
  name: string
  priceDelta: number
}

// Grupo de opciones de un producto configurable (ej. "Tamaño", "Extras").
export interface OptionGroup {
  id: number
  name: string
  minSelect: number
  maxSelect: number
  options: ProductOption[]
}

// Producto con sus grupos de opciones, usado por el configurador.
export interface ProductDetail extends Product {
  optionGroups: OptionGroup[]
}

// Snapshot de una opción elegida en un pedido (se congela al crear el pedido).
export interface OrderOption {
  optionId: number
  groupName: string
  optionName: string
  priceDelta: number
}

export interface OrderItem {
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  options: OrderOption[]
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'cash' | 'transfer'
export type PaymentStatus = 'pending' | 'paid'

export interface DeliveryInfo {
  name: string
  phone: string
  address: string
  commune: string | null
  instructions: string | null
}

export interface Order {
  id: number
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  delivery: DeliveryInfo
  items: OrderItem[]
  createdAt: string
}

// Resumen de un pedido para listados (admin).
export interface OrderSummary {
  id: number
  status: OrderStatus
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  customerName: string
  createdAt: string
}

export interface DashboardStats {
  pendingOrders: number
  ordersToday: number
  salesToday: number
  recentOrders: OrderSummary[]
}

// Opción / grupo de opciones con campos de administración (activo y orden).
export interface AdminOption {
  id: number
  name: string
  priceDelta: number
  active: boolean
  sortOrder: number
}

export interface AdminOptionGroup {
  id: number
  name: string
  minSelect: number
  maxSelect: number
  active: boolean
  sortOrder: number
  options: AdminOption[]
}
