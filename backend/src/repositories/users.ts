import { pool } from '../db/pool'

export interface User {
  id: number
  email: string
  passwordHash: string
  role: 'admin' | 'customer'
  name: string
}

interface UserRow {
  id: number
  email: string
  password_hash: string
  role: 'admin' | 'customer'
  name: string
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    'SELECT id, email, password_hash, role, name FROM users WHERE email = $1',
    [email],
  )
  const row = result.rows[0]
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    name: row.name,
  }
}
