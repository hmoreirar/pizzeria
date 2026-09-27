import { pool } from '../db/pool'
import type { Product } from '../types'

interface ProductRow {
  id: number
  categoryId: number
  categoryName: string
  name: string
  description: string | null
  image: string | null
  // `pg` devuelve NUMERIC como string; lo convertimos a number al mapear.
  price: string
  active: boolean
}

export async function listProducts(categoryId?: number): Promise<Product[]> {
  const params: number[] = []

  let sql = `
    SELECT
      p.id,
      p.category_id AS "categoryId",
      c.name AS "categoryName",
      p.name,
      p.description,
      p.image,
      p.price,
      p.active
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.active = TRUE
  `

  if (categoryId !== undefined) {
    params.push(categoryId)
    sql += ` AND p.category_id = $${params.length}`
  }

  sql += ' ORDER BY p.name'

  const result = await pool.query<ProductRow>(sql, params)

  return result.rows.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    name: row.name,
    description: row.description,
    image: row.image,
    price: Number(row.price),
    active: row.active,
  }))
}
