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
  configurable: boolean
}

export interface ProductOption {
  id: number
  name: string
  priceDelta: number
}

export interface OptionGroup {
  id: number
  name: string
  minSelect: number
  maxSelect: number
  options: ProductOption[]
}

export interface ProductDetail extends Product {
  optionGroups: OptionGroup[]
}

export interface Settings {
  deliveryFee: number
}

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

export interface CreateOrderPayload {
  delivery: {
    name: string
    phone: string
    address: string
    commune?: string
    instructions?: string
  }
  paymentMethod: PaymentMethod
  items: Array<{ productId: number; optionIds: number[]; quantity: number }>
}

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

export interface ProductInput {
  name: string
  categoryId: number
  description: string | null
  image: string | null
  price: number
  active: boolean
}

export interface CategoryInput {
  name: string
  active: boolean
  sortOrder: number
}

export interface OptionGroupInput {
  name: string
  minSelect: number
  maxSelect: number
  sortOrder: number
  active: boolean
}

export interface OptionInput {
  name: string
  priceDelta: number
  sortOrder: number
  active: boolean
}
