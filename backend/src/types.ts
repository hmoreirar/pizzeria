// Tipos de dominio compartidos por repositorios y rutas.

export interface Category {
  id: number
  name: string
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
}
