import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import { pool } from '../src/db/pool'

async function seedCatalog() {
  await pool.query(`INSERT INTO categories (id, name) VALUES (1, 'Pizzas'), (2, 'Bebidas')`)
  // Pizza configurable con grupo "Tamaño".
  await pool.query(`
    INSERT INTO products (id, category_id, name, price, active)
    VALUES (1, 1, 'Pizza Margherita', 8900, TRUE)
  `)
  const group = await pool.query<{ id: number }>(
    `INSERT INTO option_groups (product_id, name, min_select, max_select)
     VALUES (1, 'Tamaño', 1, 1) RETURNING id`,
  )
  await pool.query(`
    INSERT INTO options (option_group_id, name, price_delta, sort_order)
    VALUES
      (${group.rows[0].id}, 'Grande · 32 cm', 0, 0),
      (${group.rows[0].id}, 'Familiar · 38 cm', 3000, 1)
  `)
  // Producto simple.
  await pool.query(`
    INSERT INTO products (id, category_id, name, price, active)
    VALUES (2, 2, 'Bebida Cola', 2000, TRUE)
  `)
  // Producto desactivado.
  await pool.query(`
    INSERT INTO products (id, category_id, name, price, active)
    VALUES (3, 2, 'Oculta', 1000, FALSE)
  `)
}

beforeEach(async () => {
  await pool.query('TRUNCATE categories, products, orders RESTART IDENTITY CASCADE')
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
  )
})

describe('POST /api/orders/quote', () => {
  it('recalcula el precio base + opciones y aplica el despacho', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders/quote')
      .send({
        items: [
          { productId: 1, optionIds: [1], quantity: 2 },
          { productId: 2, optionIds: [], quantity: 1 },
        ],
      })

    expect(res.status).toBe(200)
    expect(res.body.subtotal).toBe(19800)
    expect(res.body.deliveryFee).toBe(2500)
    expect(res.body.total).toBe(22300)
    expect(res.body.items[0]).toMatchObject({
      productId: 1,
      productName: 'Pizza Margherita',
      unitPrice: 8900,
      quantity: 2,
      lineTotal: 17800,
    })
  })

  it('suma el price_delta de la opción seleccionada (Familiar)', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders/quote')
      .send({ items: [{ productId: 1, optionIds: [2], quantity: 1 }] })

    expect(res.status).toBe(200)
    expect(res.body.items[0].unitPrice).toBe(11900)
    expect(res.body.subtotal).toBe(11900)
  })

  it('responde 400 si el producto no existe o está desactivado', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders/quote')
      .send({ items: [{ productId: 3, optionIds: [], quantity: 1 }] })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('no disponible')
  })

  it('responde 400 si falta elegir una opción obligatoria (tamaño)', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders/quote')
      .send({ items: [{ productId: 1, optionIds: [], quantity: 1 }] })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Tamaño')
  })

  it('responde 400 si una opción no pertenece al producto', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders/quote')
      .send({ items: [{ productId: 2, optionIds: [1], quantity: 1 }] })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('no pertenece')
  })

  it('responde 400 si el carrito está vacío', async () => {
    const res = await request(app).post('/api/orders/quote').send({ items: [] })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/orders', () => {
  it('crea el pedido con totales recalculados y snapshot histórico', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders')
      .send({
        delivery: {
          name: 'María',
          phone: '+56912345678',
          address: 'Av. Siempre Viva 123',
          commune: 'Providencia',
          instructions: 'Dejar en recepción',
        },
        paymentMethod: 'cash',
        items: [
          { productId: 1, optionIds: [1], quantity: 2 },
          { productId: 2, optionIds: [], quantity: 1 },
        ],
      })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      status: 'pending',
      subtotal: 19800,
      deliveryFee: 2500,
      total: 22300,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
    })
    expect(res.body.delivery).toMatchObject({
      name: 'María',
      phone: '+56912345678',
      address: 'Av. Siempre Viva 123',
      commune: 'Providencia',
    })
    expect(res.body.items).toHaveLength(2)
    expect(res.body.items[0]).toMatchObject({
      productId: 1,
      productName: 'Pizza Margherita',
      unitPrice: 8900,
      quantity: 2,
    })
    expect(res.body.items[0].options).toEqual([
      {
        optionId: expect.any(Number),
        groupName: 'Tamaño',
        optionName: 'Grande · 32 cm',
        priceDelta: 0,
      },
    ])
  })

  it('responde 400 si el método de pago no es válido', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders')
      .send({
        delivery: { name: 'María', phone: '123', address: 'Calle 1' },
        paymentMethod: 'tarjeta',
        items: [{ productId: 2, optionIds: [], quantity: 1 }],
      })

    expect(res.status).toBe(400)
  })

  it('responde 400 si faltan datos de entrega', async () => {
    await seedCatalog()

    const res = await request(app)
      .post('/api/orders')
      .send({
        delivery: { name: '', phone: '', address: '' },
        paymentMethod: 'cash',
        items: [{ productId: 2, optionIds: [], quantity: 1 }],
      })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/orders/:id', () => {
  it('devuelve el pedido con sus items', async () => {
    await seedCatalog()

    const created = await request(app).post('/api/orders').send({
      delivery: { name: 'María', phone: '123', address: 'Calle 1' },
      paymentMethod: 'transfer',
      items: [{ productId: 2, optionIds: [], quantity: 1 }],
    })
    const id = created.body.id as number

    const res = await request(app).get(`/api/orders/${id}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id,
      status: 'pending',
      paymentMethod: 'transfer',
      total: 4500, // 2000 + 2500 despacho
    })
    expect(res.body.items).toHaveLength(1)
  })

  it('responde 404 si el pedido no existe', async () => {
    const res = await request(app).get('/api/orders/999')

    expect(res.status).toBe(404)
  })
})
