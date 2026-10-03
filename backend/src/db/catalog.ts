// Catálogo placeholder (el menú real está en revisión y se reemplazará al final).
// Compartido por seed.ts (reset dev) y bootstrap.ts (siembra idempotente).
// Imágenes reales de comida en frontend/public/images/.
// Pizzas (configurables) llevan grupo "Tamaño". El resto son simples.

export const categories = [
  { id: 1, name: 'Pizzas', sortOrder: 0 },
  { id: 2, name: 'Combos', sortOrder: 1 },
  { id: 3, name: 'Sides', sortOrder: 2 },
  { id: 4, name: 'Drinks', sortOrder: 3 },
  { id: 5, name: 'Deals', sortOrder: 4 },
]

export const sizeOptions = [
  { name: 'Large · 32 cm', priceDelta: 0 },
  { name: 'Family · 38 cm', priceDelta: 3000 },
]

// Pizzas: configurables, con grupo "Tamaño" (category_id = 1).
export const pizzas = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Tomato sauce, mozzarella and fresh basil.',
    price: 8900,
    image: '/images/margherita.jpg',
  },
  {
    id: 2,
    name: 'Pepperoni Pizza',
    description: 'Mozzarella and pepperoni with a crispy crust.',
    price: 10900,
    image: '/images/pepperoni.jpg',
  },
  {
    id: 7,
    name: 'Hawaiian Pizza',
    description: 'Ham, pineapple and mozzarella.',
    price: 11500,
    image: '/images/hawaiian.jpg',
  },
  {
    id: 8,
    name: 'Veggie Pizza',
    description: 'Bell peppers, mushrooms, onion and corn.',
    price: 9900,
    image: '/images/veggie.jpg',
  },
  {
    id: 9,
    name: 'Meat Lovers Pizza',
    description: 'Pepperoni, sausage, bacon and ham.',
    price: 13900,
    image: '/images/meat.jpg',
  },
  {
    id: 10,
    name: 'BBQ Chicken Pizza',
    description: 'Grilled chicken, BBQ sauce and red onion.',
    price: 12500,
    image: '/images/bbq-chicken.jpg',
  },
]

// Productos simples (sin configuración).
export const simpleProducts = [
  {
    id: 3,
    categoryId: 2,
    name: 'Family Combo',
    description: 'Two large pizzas + 2L drink.',
    price: 15900,
    image: '/images/combo.jpg',
  },
  {
    id: 17,
    categoryId: 2,
    name: 'Couple Combo',
    description: 'One large pizza + fries + 2 drinks.',
    price: 12900,
    image: '/images/hero.jpg',
  },
  {
    id: 4,
    categoryId: 3,
    name: 'French Fries',
    description: 'Crispy golden fries with salt.',
    price: 3500,
    image: '/images/fries.jpg',
  },
  {
    id: 11,
    categoryId: 3,
    name: 'Garlic Bread',
    description: 'Warm baguette with garlic butter.',
    price: 4500,
    image: '/images/garlic-bread.jpg',
  },
  {
    id: 12,
    categoryId: 3,
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings with dip.',
    price: 7900,
    image: '/images/wings.jpg',
  },
  {
    id: 13,
    categoryId: 3,
    name: 'Onion Rings',
    description: 'Crispy battered onion rings.',
    price: 4900,
    image: '/images/onion-rings.jpg',
  },
  {
    id: 5,
    categoryId: 4,
    name: 'Cola 1.5L',
    description: 'Returnable 1.5 liter bottle.',
    price: 2000,
    image: '/images/cola.jpg',
  },
  {
    id: 14,
    categoryId: 4,
    name: 'Water 500ml',
    description: 'Still mineral water 500 ml.',
    price: 1000,
    image: '/images/water.jpg',
  },
  {
    id: 15,
    categoryId: 4,
    name: 'Lemonade 1.5L',
    description: 'Fresh lemonade 1.5 liters.',
    price: 2200,
    image: '/images/lemonade.jpg',
  },
  {
    id: 16,
    categoryId: 4,
    name: 'Orange Juice',
    description: 'Fresh squeezed orange juice.',
    price: 2500,
    image: '/images/orange-juice.jpg',
  },
  {
    id: 6,
    categoryId: 5,
    name: '2x1 Pizzas',
    description: 'Two large pizzas for the price of one.',
    price: 12900,
    image: '/images/promo.jpg',
  },
  {
    id: 18,
    categoryId: 5,
    name: 'Lunch Deal',
    description: 'Personal pizza + fries + drink.',
    price: 8900,
    image: '/images/combo.jpg',
  },
]
