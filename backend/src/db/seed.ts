import { pool } from './pool'
import { hashPassword } from '../auth/password'
import { env } from '../config/env'

// ⚠️ CATÁLOGO PLACEHOLDER ⚠️
// El menú real está en revisión y se reemplazará al final del MVP.
// Los nombres llevan "(demo)" para que sea evidente que son temporales.
// Lo único definido por la especificación es el grupo "Tamaño":
//   Grande · 32 cm  → price_delta 0
//   Familiar · 38 cm → price_delta 3000
// No se inventan masas, ingredientes ni extras: se incorporarán con el menú real.

const categories = [
  { id: 1, name: 'Pizzas', sortOrder: 0 },
  { id: 2, name: 'Combos', sortOrder: 1 },
  { id: 3, name: 'Acompañamientos', sortOrder: 2 },
  { id: 4, name: 'Bebidas', sortOrder: 3 },
  { id: 5, name: 'Promociones', sortOrder: 4 },
]

// Pizzas: configurables, con grupo "Tamaño".
const pizzas = [
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
const simpleProducts = [
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

const sizeOptions = [
  { name: 'Grande · 32 cm', priceDelta: 0 },
  { name: 'Familiar · 38 cm', priceDelta: 3000 },
]

async function seed() {
  await pool.query(
    'TRUNCATE categories, products, option_groups, options, settings, orders RESTART IDENTITY CASCADE',
  )

  for (const c of categories) {
    await pool.query(
      'INSERT INTO categories (id, name, sort_order) VALUES ($1, $2, $3)',
      [c.id, c.name, c.sortOrder],
    )
  }

  for (const p of pizzas) {
    await pool.query(
      `INSERT INTO products (id, category_id, name, description, image, price, active)
       VALUES ($1, 1, $2, $3, $4, $5, TRUE)`,
      [p.id, p.name, p.description, p.image, p.price],
    )

    // Grupo "Tamaño": obligatorio, se elige exactamente una opción.
    const group = await pool.query<{ id: number }>(
      `INSERT INTO option_groups (product_id, name, min_select, max_select, sort_order)
       VALUES ($1, 'Tamaño', 1, 1, 0)
       RETURNING id`,
      [p.id],
    )

    for (let i = 0; i < sizeOptions.length; i++) {
      const o = sizeOptions[i]
      await pool.query(
        `INSERT INTO options (option_group_id, name, price_delta, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [group.rows[0].id, o.name, o.priceDelta, i],
      )
    }
  }

  for (const p of simpleProducts) {
    await pool.query(
      `INSERT INTO products (id, category_id, name, description, image, price, active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [p.id, p.categoryId, p.name, p.description, p.image, p.price],
    )
  }

  await pool.query(`INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')`)

  // Usuario administrador (idempotente; el password se resetea al valor de env).
  const passwordHash = hashPassword(env.ADMIN_PASSWORD)
  await pool.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ($1, $2, 'admin', 'Administrador')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [env.ADMIN_EMAIL, passwordHash],
  )

  const totalProducts = pizzas.length + simpleProducts.length
  console.log(
    `Seed completado: ${categories.length} categorías y ${totalProducts} productos (catálogo placeholder).`,
  )
  await pool.end()
}

seed().catch((err) => {
  console.error('Error en el seed:', err)
  process.exit(1)
})
