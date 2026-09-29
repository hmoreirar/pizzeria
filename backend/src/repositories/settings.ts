import { pool } from '../db/pool'

// Devuelve el valor de una clave de configuración, o null si no existe.
export async function getSetting(key: string): Promise<string | null> {
  const result = await pool.query<{ value: string }>(
    'SELECT value FROM settings WHERE key = $1',
    [key],
  )
  return result.rows[0]?.value ?? null
}

// Costo de despacho configurable. Se lee desde la BD (fuente de verdad),
// nunca desde el frontend.
export async function getDeliveryFee(): Promise<number> {
  const raw = await getSetting('delivery_fee')
  const value = Number(raw)
  if (raw === null || Number.isNaN(value) || value < 0) {
    throw new Error('Configuración "delivery_fee" inválida o faltante')
  }
  return value
}
