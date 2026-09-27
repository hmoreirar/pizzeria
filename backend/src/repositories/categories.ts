import { pool } from '../db/pool'
import type { Category } from '../types'

interface CategoryRow {
  id: number
  name: string
}

export async function listCategories(): Promise<Category[]> {
  const result = await pool.query<CategoryRow>(
    'SELECT id, name FROM categories ORDER BY name',
  )
  return result.rows
}
