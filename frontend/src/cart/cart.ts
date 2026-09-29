import { createContext, useContext } from 'react'

export interface CartItemOption {
  optionId: number
  groupName: string
  optionName: string
  priceDelta: number
}

export interface CartItem {
  key: string
  productId: number
  name: string
  image: string | null
  unitPrice: number
  quantity: number
  options: CartItemOption[]
}

export interface AddCartItem {
  productId: number
  name: string
  image: string | null
  unitPrice: number
  quantity: number
  options: CartItemOption[]
}

export interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: AddCartItem) => void
  setQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
