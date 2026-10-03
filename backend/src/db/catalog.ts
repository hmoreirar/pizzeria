// Menu placeholder premium (marca "Pizza House"). Estilo Domino's, gama premium.
// Compartido por seed.ts (reset dev) y bootstrap.ts (sync al arrancar).
// Imágenes reales de comida en frontend/public/images/.
// Pizzas (configurables) llevan grupo "Size". El resto son simples.

export const categories = [
  { id: 1, name: 'Pizzas', sortOrder: 0 },
  { id: 2, name: 'Combos', sortOrder: 1 },
  { id: 3, name: 'Sides', sortOrder: 2 },
  { id: 4, name: 'Drinks', sortOrder: 3 },
  { id: 5, name: 'Deals', sortOrder: 4 },
]

export const sizeOptions = [
  { name: 'Large · 32 cm', priceDelta: 0 },
  { name: 'Family · 38 cm', priceDelta: 4000 },
]

// Pizzas: configurables, con grupo "Size" (category_id = 1).
export const pizzas = [
  {
    id: 1,
    name: 'Margherita',
    description: 'San Marzano tomato, fior di mozzarella, fresh basil, extra-virgin olive oil.',
    price: 12900,
    image: '/images/margherita.jpg',
  },
  {
    id: 2,
    name: 'Pepperoni',
    description: 'Spicy pepperoni, aged mozzarella, slow-cooked tomato sauce.',
    price: 14900,
    image: '/images/pepperoni.jpg',
  },
  {
    id: 7,
    name: 'Hawaiian',
    description: 'Smoked ham, caramelized pineapple, mozzarella, tomato.',
    price: 14500,
    image: '/images/hawaiian.jpg',
  },
  {
    id: 8,
    name: 'Verdure',
    description: 'Roasted peppers, mushrooms, red onion, olives, mozzarella.',
    price: 13900,
    image: '/images/veggie.jpg',
  },
  {
    id: 9,
    name: 'Meat Lovers',
    description: 'Pepperoni, sausage, bacon, ham, mozzarella.',
    price: 17900,
    image: '/images/meat.jpg',
  },
  {
    id: 10,
    name: 'BBQ Chicken',
    description: 'Grilled chicken, smoky BBQ sauce, red onion, cilantro.',
    price: 15900,
    image: '/images/bbq-chicken.jpg',
  },
]

// Productos simples (sin configuración).
export const simpleProducts = [
  {
    id: 3,
    categoryId: 2,
    name: 'Famiglia Combo',
    description: '2 large pizzas + garlic bread + 2L drink.',
    price: 32900,
    image: '/images/combo.jpg',
  },
  {
    id: 17,
    categoryId: 2,
    name: 'Coppia Combo',
    description: '1 large pizza + truffle fries + 2 drinks.',
    price: 22900,
    image: '/images/hero.jpg',
  },
  {
    id: 4,
    categoryId: 3,
    name: 'Truffle Fries',
    description: 'Hand-cut fries, truffle oil, parmesan, parsley.',
    price: 6900,
    image: '/images/fries.jpg',
  },
  {
    id: 11,
    categoryId: 3,
    name: 'Garlic Bread',
    description: 'Wood-fired baguette, roasted garlic butter, herbs.',
    price: 5900,
    image: '/images/garlic-bread.jpg',
  },
  {
    id: 12,
    categoryId: 3,
    name: 'Buffalo Wings',
    description: 'Spicy buffalo wings with blue cheese dip.',
    price: 9900,
    image: '/images/wings.jpg',
  },
  {
    id: 13,
    categoryId: 3,
    name: 'Crispy Onion Rings',
    description: 'Beer-battered onion rings, chipotle mayo.',
    price: 6500,
    image: '/images/onion-rings.jpg',
  },
  {
    id: 5,
    categoryId: 4,
    name: 'Craft Cola 1.5L',
    description: 'Small-batch cola, 1.5 liters.',
    price: 3500,
    image: '/images/cola.jpg',
  },
  {
    id: 14,
    categoryId: 4,
    name: 'Sparkling Water 500ml',
    description: 'Chilled sparkling mineral water.',
    price: 2500,
    image: '/images/water.jpg',
  },
  {
    id: 15,
    categoryId: 4,
    name: 'Fresh Lemonade 1L',
    description: 'House-made lemonade with mint.',
    price: 4500,
    image: '/images/lemonade.jpg',
  },
  {
    id: 16,
    categoryId: 4,
    name: 'Fresh Orange Juice',
    description: 'Cold-pressed orange juice.',
    price: 4500,
    image: '/images/orange-juice.jpg',
  },
  {
    id: 6,
    categoryId: 5,
    name: '2x1 Pizzas',
    description: 'Two large pizzas for the price of one.',
    price: 22900,
    image: '/images/promo.jpg',
  },
  {
    id: 18,
    categoryId: 5,
    name: 'Lunch Express',
    description: 'Personal pizza + fries + drink.',
    price: 12900,
    image: '/images/combo.jpg',
  },
]
