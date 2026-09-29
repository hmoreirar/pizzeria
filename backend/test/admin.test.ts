import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import { pool } from '../src/db/pool'
import { hashPassword } from '../src/auth/password'

const ADMIN_EMAIL = 'admin@test.cl'
const ADMIN_PASSWORD = 'password123'

async function seedAdmin() {
  await pool.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ($1, $2, 'admin', 'Admin Test')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [ADMIN_EMAIL, hashPassword(ADMIN_PASSWORD)],
  )
}

async function loginAs(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password })
  return res.body.token as string
}

async function adminToken(): Promise<string> {
  return loginAs(ADMIN_EMAIL, ADMIN_PASSWORD)
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` }
}

beforeEach(async () => {
  await pool.query('TRUNCATE categories, products, orders, users RESTART IDENTITY CASCADE')
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
  )
  await seedAdmin()
})

describe('POST /api/auth/login', () => {
  it('devuelve token y usuario con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTypeOf('string')
    expect(res.body.user).toMatchObject({ email: ADMIN_EMAIL, role: 'admin' })
  })

  it('responde 401 con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'incorrecta' })

    expect(res.status).toBe(401)
  })

  it('responde 400 con email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-es-email', password: 'x' })

    expect(res.status).toBe(400)
  })
})

describe('Autorización de rutas admin', () => {
  it('rechaza sin token (401)', async () => {
    const res = await request(app).get('/api/admin/dashboard')
    expect(res.status).toBe(401)
  })

  it('rechaza a un usuario sin rol admin (403)', async () => {
    await pool.query(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ('cliente@test.cl', $1, 'customer', 'Cliente')`,
      [hashPassword('password123')],
    )
    const token = await loginAs('cliente@test.cl', 'password123')

    const res = await request(app).get('/api/admin/dashboard').set(auth(token))
    expect(res.status).toBe(403)
  })

  it('permite acceso al administrador (200)', async () => {
    const token = await adminToken()
    const res = await request(app).get('/api/admin/dashboard').set(auth(token))
    expect(res.status).toBe(200)
  })
})

describe('GET /api/admin/dashboard', () => {
  it('reporta pedidos pendientes, del día y ventas', async () => {
    await pool.query(`INSERT INTO categories (id, name) VALUES (1, 'Pizzas')`)
    await pool.query(`
      INSERT INTO products (id, category_id, name, price, active)
      VALUES (1, 1, 'Pizza', 8900, TRUE)
    `)

    await request(app).post('/api/orders').send({
      delivery: { name: 'A', phone: '1', address: 'C' },
      paymentMethod: 'cash',
      items: [{ productId: 1, optionIds: [], quantity: 1 }],
    })

    const token = await adminToken()
    const res = await request(app).get('/api/admin/dashboard').set(auth(token))

    expect(res.status).toBe(200)
    expect(res.body.pendingOrders).toBe(1)
    expect(res.body.ordersToday).toBe(1)
    expect(res.body.salesToday).toBe(11400) // 8900 + 2500
    expect(res.body.recentOrders).toHaveLength(1)
  })
})

describe('Gestión de pedidos (admin)', () => {
  async function createOrder() {
    await pool.query(`INSERT INTO categories (id, name) VALUES (1, 'Pizzas')`)
    await pool.query(`
      INSERT INTO products (id, category_id, name, price, active)
      VALUES (1, 1, 'Pizza', 8900, TRUE)
    `)
    const res = await request(app).post('/api/orders').send({
      delivery: { name: 'María', phone: '123', address: 'Calle 1' },
      paymentMethod: 'cash',
      items: [{ productId: 1, optionIds: [], quantity: 1 }],
    })
    return res.body.id as number
  }

  it('lista pedidos y actualiza su estado', async () => {
    const id = await createOrder()
    const token = await adminToken()

    const list = await request(app).get('/api/admin/orders').set(auth(token))
    expect(list.status).toBe(200)
    expect(list.body).toHaveLength(1)
    expect(list.body[0]).toMatchObject({ id, status: 'pending' })

    const updated = await request(app)
      .patch(`/api/admin/orders/${id}/status`)
      .set(auth(token))
      .send({ status: 'preparing' })
    expect(updated.status).toBe(200)
    expect(updated.body.status).toBe('preparing')

    const detail = await request(app).get(`/api/admin/orders/${id}`).set(auth(token))
    expect(detail.status).toBe(200)
    expect(detail.body.status).toBe('preparing')
    expect(detail.body.items).toHaveLength(1)
  })

  it('rechaza un estado inválido', async () => {
    const id = await createOrder()
    const token = await adminToken()

    const res = await request(app)
      .patch(`/api/admin/orders/${id}/status`)
      .set(auth(token))
      .send({ status: 'whatever' })

    expect(res.status).toBe(400)
  })
})

describe('Gestión de categorías (admin)', () => {
  it('crea y actualiza categorías', async () => {
    const token = await adminToken()

    const created = await request(app)
      .post('/api/admin/categories')
      .set(auth(token))
      .send({ name: 'Pizzas', active: true, sortOrder: 0 })
    expect(created.status).toBe(201)
    const id = created.body.id as number

    const updated = await request(app)
      .patch(`/api/admin/categories/${id}`)
      .set(auth(token))
      .send({ name: 'Pizzas', active: false, sortOrder: 1 })
    expect(updated.status).toBe(200)

    const list = await request(app).get('/api/admin/categories').set(auth(token))
    expect(list.body).toHaveLength(1)
    expect(list.body[0]).toMatchObject({ id, name: 'Pizzas', active: false, sortOrder: 1 })
  })
})

describe('Gestión de productos y opciones (admin)', () => {
  it('crea un producto, un grupo y una opción', async () => {
    await pool.query(`INSERT INTO categories (id, name) VALUES (1, 'Pizzas')`)
    const token = await adminToken()

    const product = await request(app)
      .post('/api/admin/products')
      .set(auth(token))
      .send({
        name: 'Pizza Margherita',
        categoryId: 1,
        description: null,
        image: null,
        price: 8900,
        active: true,
      })
    expect(product.status).toBe(201)
    const productId = product.body.id as number

    const group = await request(app)
      .post(`/api/admin/products/${productId}/option-groups`)
      .set(auth(token))
      .send({ name: 'Tamaño', minSelect: 1, maxSelect: 1, sortOrder: 0, active: true })
    expect(group.status).toBe(201)
    const groupId = group.body.id as number

    const option = await request(app)
      .post(`/api/admin/products/option-groups/${groupId}/options`)
      .set(auth(token))
      .send({ name: 'Grande · 32 cm', priceDelta: 0, sortOrder: 0, active: true })
    expect(option.status).toBe(201)

    const groups = await request(app)
      .get(`/api/admin/products/${productId}/option-groups`)
      .set(auth(token))
    expect(groups.body).toHaveLength(1)
    expect(groups.body[0].options).toHaveLength(1)
    expect(groups.body[0].options[0]).toMatchObject({ name: 'Grande · 32 cm' })

    // El producto creado aparece en el listado (incluso si lo desactivamos).
    await request(app)
      .patch(`/api/admin/products/${productId}`)
      .set(auth(token))
      .send({ name: 'Pizza Margherita', categoryId: 1, description: null, image: null, price: 9500, active: false })
    const list = await request(app).get('/api/admin/products').set(auth(token))
    expect(list.body).toHaveLength(1)
    expect(list.body[0]).toMatchObject({ id: productId, active: false, price: 9500 })
  })
})
