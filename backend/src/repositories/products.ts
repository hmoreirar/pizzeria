import { pool } from '../db/pool'
import type {
  Product,
  ProductDetail,
  OptionGroup,
  ProductOption,
  AdminOptionGroup,
  AdminOption,
} from '../types'

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
  configurable: boolean
}

interface OptionGroupRow {
  id: number
  product_id: number
  name: string
  min_select: number
  max_select: number
}

interface OptionRow {
  id: number
  option_group_id: number
  name: string
  price_delta: string
}

const PRODUCT_SELECT = `
  SELECT
    p.id,
    p.category_id AS "categoryId",
    c.name AS "categoryName",
    p.name,
    p.description,
    p.image,
    p.price,
    p.active,
    EXISTS (
      SELECT 1
        FROM option_groups og
       WHERE og.product_id = p.id AND og.active = TRUE
    ) AS configurable
    FROM products p
    JOIN categories c ON c.id = p.category_id
`

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    name: row.name,
    description: row.description,
    image: row.image,
    price: Number(row.price),
    active: row.active,
    configurable: row.configurable,
  }
}

export async function listProducts(categoryId?: number): Promise<Product[]> {
  const params: number[] = []
  let sql = PRODUCT_SELECT + ' WHERE p.active = TRUE'

  if (categoryId !== undefined) {
    params.push(categoryId)
    sql += ` AND p.category_id = $${params.length}`
  }

  sql += ' ORDER BY p.name'

  const result = await pool.query<ProductRow>(sql, params)
  return result.rows.map(mapProduct)
}

// Devuelve el producto activo con sus grupos y opciones (solo activos),
// o null si no existe o está desactivado.
export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const productResult = await pool.query<ProductRow>(
    PRODUCT_SELECT + ' WHERE p.id = $1 AND p.active = TRUE',
    [id],
  )

  const row = productResult.rows[0]
  if (!row) return null

  const groupsResult = await pool.query<OptionGroupRow>(
    `SELECT id, product_id, name, min_select, max_select
       FROM option_groups
      WHERE product_id = $1 AND active = TRUE
      ORDER BY sort_order, id`,
    [id],
  )

  const groups: OptionGroup[] = groupsResult.rows.map((g) => ({
    id: g.id,
    name: g.name,
    minSelect: g.min_select,
    maxSelect: g.max_select,
    options: [],
  }))

  if (groups.length > 0) {
    const optionsResult = await pool.query<OptionRow>(
      `SELECT id, option_group_id, name, price_delta
         FROM options
        WHERE option_group_id = ANY($1::int[]) AND active = TRUE
        ORDER BY sort_order, id`,
      [groups.map((g) => g.id)],
    )

    const optionsByGroup = new Map<number, ProductOption[]>()
    for (const o of optionsResult.rows) {
      const option: ProductOption = {
        id: o.id,
        name: o.name,
        priceDelta: Number(o.price_delta),
      }
      const list = optionsByGroup.get(o.option_group_id)
      if (list) {
        list.push(option)
      } else {
        optionsByGroup.set(o.option_group_id, [option])
      }
    }

    for (const group of groups) {
      group.options = optionsByGroup.get(group.id) ?? []
    }
  }

  return {
    ...mapProduct(row),
    optionGroups: groups,
  }
}

// ====== Funciones de administración ======

export interface ProductInput {
  name: string
  categoryId: number
  description: string | null
  image: string | null
  price: number
  active: boolean
}

export async function listAllProducts(): Promise<Product[]> {
  const result = await pool.query<ProductRow>(PRODUCT_SELECT + ' ORDER BY p.name')
  return result.rows.map(mapProduct)
}

export async function getProductByIdAdmin(id: number): Promise<Product | null> {
  const result = await pool.query<ProductRow>(PRODUCT_SELECT + ' WHERE p.id = $1', [id])
  const row = result.rows[0]
  return row ? mapProduct(row) : null
}

export async function createProduct(input: ProductInput): Promise<{ id: number }> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO products (category_id, name, description, image, price, active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [input.categoryId, input.name, input.description, input.image, input.price, input.active],
  )
  return { id: result.rows[0].id }
}

export async function updateProduct(id: number, input: ProductInput): Promise<boolean> {
  const result = await pool.query(
    `UPDATE products
        SET category_id = $2, name = $3, description = $4, image = $5, price = $6, active = $7
      WHERE id = $1`,
    [id, input.categoryId, input.name, input.description, input.image, input.price, input.active],
  )
  return (result.rowCount ?? 0) > 0
}

interface AdminOptionGroupRow {
  id: number
  name: string
  min_select: number
  max_select: number
  active: boolean
  sort_order: number
}

interface AdminOptionRow {
  id: number
  option_group_id: number
  name: string
  price_delta: string
  active: boolean
  sort_order: number
}

// Todos los grupos y opciones (activos e inactivos) de un producto, para edición.
export async function listOptionGroupsForAdmin(productId: number): Promise<AdminOptionGroup[]> {
  const groupsResult = await pool.query<AdminOptionGroupRow>(
    `SELECT id, name, min_select, max_select, active, sort_order
       FROM option_groups
      WHERE product_id = $1
      ORDER BY sort_order, id`,
    [productId],
  )

  const groups: AdminOptionGroup[] = groupsResult.rows.map((g) => ({
    id: g.id,
    name: g.name,
    minSelect: g.min_select,
    maxSelect: g.max_select,
    active: g.active,
    sortOrder: g.sort_order,
    options: [],
  }))

  if (groups.length > 0) {
    const optionsResult = await pool.query<AdminOptionRow>(
      `SELECT id, option_group_id, name, price_delta, active, sort_order
         FROM options
        WHERE option_group_id = ANY($1::int[])
        ORDER BY sort_order, id`,
      [groups.map((g) => g.id)],
    )

    const byGroup = new Map<number, AdminOption[]>()
    for (const o of optionsResult.rows) {
      const option: AdminOption = {
        id: o.id,
        name: o.name,
        priceDelta: Number(o.price_delta),
        active: o.active,
        sortOrder: o.sort_order,
      }
      const list = byGroup.get(o.option_group_id)
      if (list) list.push(option)
      else byGroup.set(o.option_group_id, [option])
    }
    for (const group of groups) {
      group.options = byGroup.get(group.id) ?? []
    }
  }

  return groups
}

export interface OptionGroupInput {
  name: string
  minSelect: number
  maxSelect: number
  sortOrder: number
  active: boolean
}

export async function createOptionGroup(
  productId: number,
  input: OptionGroupInput,
): Promise<{ id: number }> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO option_groups (product_id, name, min_select, max_select, sort_order, active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [productId, input.name, input.minSelect, input.maxSelect, input.sortOrder, input.active],
  )
  return { id: result.rows[0].id }
}

export async function updateOptionGroup(id: number, input: OptionGroupInput): Promise<boolean> {
  const result = await pool.query(
    `UPDATE option_groups
        SET name = $2, min_select = $3, max_select = $4, sort_order = $5, active = $6
      WHERE id = $1`,
    [id, input.name, input.minSelect, input.maxSelect, input.sortOrder, input.active],
  )
  return (result.rowCount ?? 0) > 0
}

export async function deleteOptionGroup(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM option_groups WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

export interface OptionInput {
  name: string
  priceDelta: number
  sortOrder: number
  active: boolean
}

export async function createOption(groupId: number, input: OptionInput): Promise<{ id: number }> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO options (option_group_id, name, price_delta, sort_order, active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [groupId, input.name, input.priceDelta, input.sortOrder, input.active],
  )
  return { id: result.rows[0].id }
}

export async function updateOption(id: number, input: OptionInput): Promise<boolean> {
  const result = await pool.query(
    `UPDATE options
        SET name = $2, price_delta = $3, sort_order = $4, active = $5
      WHERE id = $1`,
    [id, input.name, input.priceDelta, input.sortOrder, input.active],
  )
  return (result.rowCount ?? 0) > 0
}

export async function deleteOption(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM options WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}
