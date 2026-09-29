import { pool } from '../db/pool'
import type { OrderItem, OrderOption } from '../types'

// Error de validación del carrito: la ruta lo responde como 400.
export class ValidationError extends Error {}

export interface QuoteItemInput {
  productId: number
  optionIds: number[]
  quantity: number
}

export interface PricingResult {
  items: OrderItem[]
  subtotal: number
}

interface ProductRow {
  id: number
  name: string
  price: string
  active: boolean
}

interface GroupRow {
  id: number
  name: string
  min_select: number
  max_select: number
}

interface OptionRow {
  id: number
  option_group_id: number
  group_name: string
  name: string
  price_delta: string
}

// Fuente de verdad del precio (especificación §1/§8/§10).
// Valida producto, opciones y pertenencia, y recalcula el precio desde la BD.
// Nunca confía en un precio enviado por el cliente.
export async function priceItems(items: QuoteItemInput[]): Promise<PricingResult> {
  const priced: OrderItem[] = []

  for (const item of items) {
    // 1. El producto debe existir y estar disponible.
    const productResult = await pool.query<ProductRow>(
      'SELECT id, name, price, active FROM products WHERE id = $1',
      [item.productId],
    )
    const product = productResult.rows[0]
    if (!product || !product.active) {
      throw new ValidationError(`Producto "${item.productId}" no disponible`)
    }

    // 2. Grupos activos del producto (para validar pertenencia y min/max).
    const groupsResult = await pool.query<GroupRow>(
      `SELECT id, name, min_select, max_select
         FROM option_groups
        WHERE product_id = $1 AND active = TRUE
        ORDER BY sort_order, id`,
      [item.productId],
    )
    const groups = groupsResult.rows

    // 3. Las opciones deben existir, estar activas y pertenecer al producto.
    const optionIds = [...new Set(item.optionIds)]
    const selectedByGroup = new Map<number, OptionRow[]>()
    const optionSnapshots: OrderOption[] = []
    let priceDeltaSum = 0

    if (optionIds.length > 0) {
      const optionsResult = await pool.query<OptionRow>(
        `SELECT o.id, o.option_group_id, g.name AS group_name, o.name, o.price_delta
           FROM options o
           JOIN option_groups g ON g.id = o.option_group_id
          WHERE o.id = ANY($1::int[]) AND o.active = TRUE`,
        [optionIds],
      )

      const foundIds = new Set(optionsResult.rows.map((r) => r.id))
      for (const id of optionIds) {
        if (!foundIds.has(id)) {
          throw new ValidationError(`Opción "${id}" no disponible`)
        }
      }

      for (const row of optionsResult.rows) {
        const group = groups.find((g) => g.id === row.option_group_id)
        if (!group) {
          throw new ValidationError(`Opción "${row.name}" no pertenece al producto`)
        }
        if (!selectedByGroup.has(group.id)) selectedByGroup.set(group.id, [])
        selectedByGroup.get(group.id)!.push(row)
        priceDeltaSum += Number(row.price_delta)
        optionSnapshots.push({
          optionId: row.id,
          groupName: row.group_name,
          optionName: row.name,
          priceDelta: Number(row.price_delta),
        })
      }
    }

    // 4. Validar selección mínima/máxima por grupo (ej. tamaño obligatorio).
    for (const group of groups) {
      const count = (selectedByGroup.get(group.id) ?? []).length
      if (count < group.min_select) {
        throw new ValidationError(`Falta elegir una opción en "${group.name}"`)
      }
      if (count > group.max_select) {
        throw new ValidationError(`Demasiadas opciones en "${group.name}"`)
      }
    }

    // 5. Recalcular: precio base + suma de sobreprecios.
    const unitPrice = Number(product.price) + priceDeltaSum
    priced.push({
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
      options: optionSnapshots,
    })
  }

  const subtotal = priced.reduce((sum, item) => sum + item.lineTotal, 0)
  return { items: priced, subtotal }
}
