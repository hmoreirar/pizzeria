// Menú placeholder premium (marca "Pizza House"). Estilo Domino's, gama premium.
// Compartido por seed.ts (reset dev) y bootstrap.ts (sync al arrancar).
// Imágenes reales de comida en frontend/public/images/.
// Pizzas (configurables) llevan grupo "Tamaño". El resto son simples.

export const categories = [
  { id: 1, name: 'Pizzas', sortOrder: 0 },
  { id: 2, name: 'Combos', sortOrder: 1 },
  { id: 3, name: 'Acompañamientos', sortOrder: 2 },
  { id: 4, name: 'Bebidas', sortOrder: 3 },
  { id: 5, name: 'Ofertas', sortOrder: 4 },
]

export const sizeOptions = [
  { name: 'Grande · 32 cm', priceDelta: 0 },
  { name: 'Familiar · 38 cm', priceDelta: 4000 },
]

// Pizzas: configurables, con grupo "Tamaño" (category_id = 1).
export const pizzas = [
  {
    id: 1,
    name: 'Margherita',
    description: 'Tomate San Marzano, fior di mozzarella, albahaca fresca y aceite de oliva extra virgen.',
    price: 12900,
    image: '/images/margherita.jpg',
  },
  {
    id: 2,
    name: 'Pepperoni',
    description: 'Pepperoni picante, mozzarella madurada y salsa de tomate cocida lentamente.',
    price: 14900,
    image: '/images/pepperoni.jpg',
  },
  {
    id: 7,
    name: 'Hawaiana',
    description: 'Jamón ahumado, piña caramelizada, mozzarella y tomate.',
    price: 14500,
    image: '/images/hawaiian.jpg',
  },
  {
    id: 8,
    name: 'Vegetariana',
    description: 'Pimientos asados, champiñones, cebolla roja, aceitunas y mozzarella.',
    price: 13900,
    image: '/images/veggie.jpg',
  },
  {
    id: 9,
    name: 'Carnívora',
    description: 'Pepperoni, salchicha, tocino, jamón y mozzarella.',
    price: 17900,
    image: '/images/meat.jpg',
  },
  {
    id: 10,
    name: 'Pollo BBQ',
    description: 'Pollo a la parrilla, salsa BBQ ahumada, cebolla roja y cilantro.',
    price: 15900,
    image: '/images/bbq-chicken.jpg',
  },
]

// Productos simples (sin configuración).
export const simpleProducts = [
  {
    id: 3,
    categoryId: 2,
    name: 'Combo Familia',
    description: '2 pizzas grandes + pan de ajo + bebida de 2L.',
    price: 32900,
    image: '/images/combo.jpg',
  },
  {
    id: 17,
    categoryId: 2,
    name: 'Combo Pareja',
    description: '1 pizza grande + pan de ajo + 2 bebidas.',
    price: 22900,
    image: '/images/coppia.jpg',
  },
  {
    id: 4,
    categoryId: 3,
    name: 'Papas a la Trufa',
    description: 'Papas cortadas a mano, aceite de trufa, parmesano y perejil.',
    price: 6900,
    image: '/images/fries.jpg',
  },
  {
    id: 11,
    categoryId: 3,
    name: 'Pan de Ajo',
    description: 'Baguette al horno de leña, mantequilla de ajo asado y hierbas.',
    price: 5900,
    image: '/images/garlic-bread.jpg',
  },
  {
    id: 12,
    categoryId: 3,
    name: 'Alitas Búfalo',
    description: 'Alitas picantes con salsa búfalo y dip de queso azul.',
    price: 9900,
    image: '/images/wings.jpg',
  },
  {
    id: 13,
    categoryId: 3,
    name: 'Aros de Cebolla',
    description: 'Aros de cebolla rebozados en cerveza con mayonesa chipotle.',
    price: 6500,
    image: '/images/onion-rings.jpg',
  },
  {
    id: 5,
    categoryId: 4,
    name: 'Cola Artesanal 1.5L',
    description: 'Cola de producción artesanal, 1,5 litros.',
    price: 3500,
    image: '/images/cola.jpg',
  },
  {
    id: 14,
    categoryId: 4,
    name: 'Agua con Gas 500ml',
    description: 'Agua mineral con gas, bien fría.',
    price: 2500,
    image: '/images/water.jpg',
  },
  {
    id: 15,
    categoryId: 4,
    name: 'Limonada 1L',
    description: 'Limonada casera con menta.',
    price: 4500,
    image: '/images/lemonade.jpg',
  },
  {
    id: 16,
    categoryId: 4,
    name: 'Jugo de Naranja',
    description: 'Jugo de naranja prensado en frío.',
    price: 4500,
    image: '/images/orange-juice.jpg',
  },
  {
    id: 6,
    categoryId: 5,
    name: '2x1 Pizzas',
    description: 'Dos pizzas grandes al precio de una.',
    price: 22900,
    image: '/images/promo.jpg',
  },
  {
    id: 18,
    categoryId: 5,
    name: 'Almuerzo Express',
    description: 'Pizza personal + ensalada + bebida.',
    price: 12900,
    image: '/images/lunch.jpg',
  },
]
