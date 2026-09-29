import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import { pool } from '../src/db/pool'

// Antes de cada test dejamos las tablas limpias para que los tests
// no dependan de datos previos ni se pisen entre sí.
beforeEach(async () => {
  await pool.query('TRUNCATE categories, products RESTART IDENTITY CASCADE')
})

describe('GET /api/categories', () => {
  it('devuelve solo las categorías activas, ordenadas por sort_order y nombre', async () => {
    await pool.query(`
      INSERT INTO categories (name, active, sort_order) VALUES
        ('Bebidas', TRUE, 3),
        ('Pizzas', TRUE, 0),
        ('Promociones', TRUE, 4),
        ('Oculta', FALSE, 99)
    `)

    const res = await request(app).get('/api/categories')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { id: expect.any(Number), name: 'Pizzas', active: true, sortOrder: 0 },
      { id: expect.any(Number), name: 'Bebidas', active: true, sortOrder: 3 },
      { id: expect.any(Number), name: 'Promociones', active: true, sortOrder: 4 },
    ])
  })

  it('devuelve un arreglo vacío cuando no hay categorías', async () => {
    const res = await request(app).get('/api/categories')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})
