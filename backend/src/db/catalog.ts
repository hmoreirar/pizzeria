// Catálogo placeholder (el menú real está en revisión y se reemplazará al final).
// Compartido por seed.ts (reset dev) y bootstrap.ts (siembra prod si está vacío).
// Imágenes reales de comida en frontend/public/images/.

export const categories = [
  { id: 1, name: 'Pizzas', sortOrder: 0 },
  { id: 2, name: 'Combos', sortOrder: 1 },
  { id: 3, name: 'Sides', sortOrder: 2 },
  { id: 4, name: 'Drinks', sortOrder: 3 },
  { id: 5, name: 'Deals', sortOrder: 4 },
]

// Pizzas: configurables, con grupo "Tamaño".
export const pizzas = [
  {
    id: 1,
    name: 'Margherita Pizza (demo)',
    description: 'Tomato sauce, mozzarella and fresh basil.',
    price: 8900,
    image: '/images/margherita.jpg',
  },
  {
    id: 2,
    name: 'Pepperoni Pizza (demo)',
    description: 'Mozzarella and pepperoni with a crispy crust.',
    price: 10900,
    image: '/images/pepperoni.jpg',
  },
]

// Productos simples (sin configuración).
export const simpleProducts = [
  {
    id: 3,
    categoryId: 2,
    name: 'Family Combo (demo)',
    description: 'Large pizza + 1.5L drink.',
    price: 15900,
    image: '/images/combo.jpg',
  },
  {
    id: 4,
    categoryId: 3,
    name: 'French Fries (demo)',
    description: 'Portion of salted fries.',
    price: 3500,
    image: '/images/fries.jpg',
  },
  {
    id: 5,
    categoryId: 4,
    name: 'Cola 1.5L (demo)',
    description: 'Returnable 1.5 liter bottle.',
    price: 2000,
    image: '/images/cola.jpg',
  },
  {
    id: 6,
    categoryId: 5,
    name: '2x1 Pizzas (demo)',
    description: 'Two large pizzas for the price of one.',
    price: 12900,
    image: '/images/promo.jpg',
  },
]

export const sizeOptions = [
  { name: 'Large · 32 cm', priceDelta: 0 },
  { name: 'Family · 38 cm', priceDelta: 3000 },
]
