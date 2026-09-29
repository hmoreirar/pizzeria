import { pool } from '../db/pool'
import type { Category } from '../types'

interface CategoryRow {
  id: number
  name: string
  active: boolean
  sort_order: number
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    active: row.active,
    sortOrder: row.sort_order,
  }
}

// Lista las categorías activas, ordenadas para la navegación (sort_order, luego nombre).
export async function listCategories(): Promise<Category[]> {
  const result = await pool.query<CategoryRow>(
    `SELECT id, name, active, sort_order
       FROM categories
      WHERE active = TRUE
      ORDER BY sort_order, name`,
  )
  return result.rows.map(mapCategory)
}

// ====== Funciones de administración ======

// Todas las categorías (activas e inactivas) para el panel administrativo.
export async function listAllCategories(): Promise<Category[]> {
  const result = await pool.query<CategoryRow>(
    `SELECT id, name, active, sort_order
       FROM categories
      ORDER BY sort_order, name`,
  )
  return result.rows.map(mapCategory)
}

export interface CategoryInput {
  name: string
  active: boolean
  sortOrder: number
}

export async function createCategory(input: CategoryInput): Promise<{ id: number }> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO categories (name, active, sort_order) VALUES ($1, $2, $3) RETURNING id`,
    [input.name, input.active, input.sortOrder],
  )
  return { id: result.rows[0].id }
}

export async function updateCategory(id: number, input: CategoryInput): Promise<boolean> {
  const result = await pool.query(
    `UPDATE categories SET name = $2, active = $3, sort_order = $4 WHERE id = $1`,
    [id, input.name, input.active, input.sortOrder],
  )
  return (result.rowCount ?? 0) > 0
}
