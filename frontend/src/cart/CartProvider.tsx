import { useEffect, useState, type ReactNode } from 'react'
import { CartContext, type AddCartItem, type CartItem } from './cart'

const STORAGE_KEY = 'pizzeria-cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  // Persistencia: el carrito sobrevive a recargar la página.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(item: AddCartItem) {
    const optionIds = item.options.map((o) => o.optionId).sort((a, b) => a - b)
    const key = `${item.productId}:${optionIds.join('.')}`

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      }
      return [
        ...prev,
        {
          key,
          productId: item.productId,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          options: item.options,
        },
      ]
    })
  }

  function setQuantity(key: string, quantity: number) {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key))
      return
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)))
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  function clearCart() {
    setItems([])
  }

  const itemCount = items.reduce((n, i) => n + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, setQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
