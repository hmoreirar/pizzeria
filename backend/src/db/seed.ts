import { pool } from './pool'

// Datos de ejemplo para desarrollo y demo.
// Se insertan con IDs fijos para que el catálogo sea determinista.
const categories = [
  { id: 1, name: 'Pizzas' },
  { id: 2, name: 'Bebidas' },
  { id: 3, name: 'Postres' },
]

const products = [
  { id: 1, categoryId: 1, name: 'Margherita', description: 'Salsa de tomate, mozzarella y albahaca fresca.', price: 8900, image: 'https://picsum.photos/seed/pizza-margherita/400/300' },
  { id: 2, categoryId: 1, name: 'Pepperoni', description: 'Mozzarella y pepperoni con borde crujiente.', price: 10900, image: 'https://picsum.photos/seed/pizza-pepperoni/400/300' },
  { id: 3, categoryId: 1, name: 'Napolitana', description: 'Tomate, mozzarella, orégano y aceitunas.', price: 9900, image: 'https://picsum.photos/seed/pizza-napolitana/400/300' },
  { id: 4, categoryId: 1, name: 'Vegetariana', description: 'Pimientos, champiñones, cebolla y maíz.', price: 9500, image: 'https://picsum.photos/seed/pizza-vegetariana/400/300' },
  { id: 5, categoryId: 2, name: 'Bebida cola 1.5L', description: 'Botella retornable de 1.5 litros.', price: 2000, image: 'https://picsum.photos/seed/bebida-cola/400/300' },
  { id: 6, categoryId: 2, name: 'Agua mineral', description: 'Agua mineral sin gas 500 ml.', price: 1500, image: null },
  { id: 7, categoryId: 3, name: 'Tiramisú', description: 'Postre italiano con café y cacao.', price: 3900, image: 'https://picsum.photos/seed/tiramisu/400/300' },
  { id: 8, categoryId: 3, name: 'Brownie', description: 'Brownie de chocolate con nueces.', price: 3500, image: null },
]

async function seed() {
  await pool.query('TRUNCATE categories, products RESTART IDENTITY CASCADE')

  for (const c of categories) {
    await pool.query('INSERT INTO categories (id, name) VALUES ($1, $2)', [c.id, c.name])
  }

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, category_id, name, description, image, price, active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [p.id, p.categoryId, p.name, p.description, p.image, p.price],
    )
  }

  console.log(`Seed completado: ${categories.length} categorías y ${products.length} productos.`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Error en el seed:', err)
  process.exit(1)
})
