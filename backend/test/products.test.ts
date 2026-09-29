import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import { pool } from '../src/db/pool'

async function seedCatalog() {
  await pool.query(`INSERT INTO categories (id, name) VALUES (1, 'Pizzas'), (2, 'Bebidas')`)
  await pool.query(`
    INSERT INTO products (category_id, name, description, price, active)
    VALUES
      (1, 'Margherita', 'Mozzarella y albahaca', 8900, TRUE),
      (1, 'Pepperoni', NULL, 10900, TRUE),
      (2, 'Agua mineral', NULL, 1500, TRUE),
      (1, 'Oculta', 'Este producto está desactivado', 5000, FALSE)
  `)
}

async function seedConfigurablePizza() {
  await pool.query(`INSERT INTO categories (id, name) VALUES (1, 'Pizzas')`)
  await pool.query(`
    INSERT INTO products (id, category_id, name, description, price, active)
    VALUES (1, 1, 'Margherita', 'Mozzarella y albahaca', 8900, TRUE)
  `)
  await pool.query(`
    INSERT INTO option_groups (id, product_id, name, min_select, max_select, sort_order)
    VALUES (1, 1, 'Tamaño', 1, 1, 0)
  `)
  await pool.query(`
    INSERT INTO options (option_group_id, name, price_delta, sort_order)
    VALUES
      (1, 'Grande · 32 cm', 0, 0),
      (1, 'Familiar · 38 cm', 3000, 1)
  `)
}

beforeEach(async () => {
  await pool.query('TRUNCATE categories, products RESTART IDENTITY CASCADE')
})

describe('GET /api/products', () => {
  it('devuelve solo los productos activos con el nombre de su categoría', async () => {
    await seedCatalog()

    const res = await request(app).get('/api/products')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
    expect(res.body.map((p: { name: string }) => p.name)).toEqual([
      'Agua mineral',
      'Margherita',
      'Pepperoni',
    ])
    const margherita = res.body.find((p: { name: string }) => p.name === 'Margherita')
    expect(margherita).toMatchObject({
      categoryName: 'Pizzas',
      price: 8900,
      active: true,
    })
  })

  it('filtra por categoría', async () => {
    await seedCatalog()

    const res = await request(app).get('/api/products?category=2')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Agua mineral')
  })

  it('responde 400 si "category" no es un entero positivo', async () => {
    const res = await request(app).get('/api/products?category=abc')

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('category')
  })

  it('devuelve un arreglo vacío cuando no hay productos', async () => {
    const res = await request(app).get('/api/products')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('GET /api/products/:id', () => {
  it('devuelve el producto con sus grupos y opciones', async () => {
    await seedConfigurablePizza()

    const res = await request(app).get('/api/products/1')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: 1,
      name: 'Margherita',
      price: 8900,
      configurable: true,
    })
    expect(res.body.optionGroups).toHaveLength(1)
    expect(res.body.optionGroups[0]).toMatchObject({
      name: 'Tamaño',
      minSelect: 1,
      maxSelect: 1,
    })
    expect(res.body.optionGroups[0].options).toEqual([
      { id: expect.any(Number), name: 'Grande · 32 cm', priceDelta: 0 },
      { id: expect.any(Number), name: 'Familiar · 38 cm', priceDelta: 3000 },
    ])
  })

  it('responde 404 si el producto no existe o está desactivado', async () => {
    const res = await request(app).get('/api/products/999')

    expect(res.status).toBe(404)
  })

  it('responde 400 si "id" no es un entero positivo', async () => {
    const res = await request(app).get('/api/products/abc')

    expect(res.status).toBe(400)
  })
})
