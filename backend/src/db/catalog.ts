// Catálogo placeholder (el menú real está en revisión y se reemplazará al final).
// Compartido por seed.ts (reset dev) y bootstrap.ts (siembra prod si está vacío).
// Solo el grupo "Tamaño" es dato de especificación. No se inventan masas/extras.

export const categories = [
  { id: 1, name: 'Pizzas', sortOrder: 0 },
  { id: 2, name: 'Combos', sortOrder: 1 },
  { id: 3, name: 'Acompañamientos', sortOrder: 2 },
  { id: 4, name: 'Bebidas', sortOrder: 3 },
  { id: 5, name: 'Promociones', sortOrder: 4 },
]

// Pizzas: configurables, con grupo "Tamaño".
export const pizzas = [
  {
    id: 1,
    name: 'Pizza Margherita (demo)',
    description: 'Salsa de tomate, mozzarella y albahaca fresca.',
    price: 8900,
    image: 'https://picsum.photos/seed/pizza-margherita/400/300',
  },
  {
    id: 2,
    name: 'Pizza Pepperoni (demo)',
    description: 'Mozzarella y pepperoni con borde crujiente.',
    price: 10900,
    image: 'https://picsum.photos/seed/pizza-pepperoni/400/300',
  },
]

// Productos simples (sin configuración).
export const simpleProducts = [
  {
    id: 3,
    categoryId: 2,
    name: 'Combo Familiar (demo)',
    description: 'Pizza grande + bebida 1.5L.',
    price: 15900,
    image: 'https://picsum.photos/seed/combo-familiar/400/300',
  },
  {
    id: 4,
    categoryId: 3,
    name: 'Papas Fritas (demo)',
    description: 'Porción de papas fritas con sal.',
    price: 3500,
    image: 'https://picsum.photos/seed/papas-fritas/400/300',
  },
  {
    id: 5,
    categoryId: 4,
    name: 'Bebida Cola 1.5L (demo)',
    description: 'Botella retornable de 1.5 litros.',
    price: 2000,
    image: 'https://picsum.photos/seed/bebida-cola/400/300',
  },
  {
    id: 6,
    categoryId: 5,
    name: '2x1 Pizzas (demo)',
    description: 'Dos pizzas grandes por el precio de una.',
    price: 12900,
    image: 'https://picsum.photos/seed/2x1-pizzas/400/300',
  },
]

export const sizeOptions = [
  { name: 'Grande · 32 cm', priceDelta: 0 },
  { name: 'Familiar · 38 cm', priceDelta: 3000 },
]
