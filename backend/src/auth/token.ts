import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface TokenPayload {
  sub: number
  role: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string): TokenPayload {
  // Firmamos el token con nuestro TokenPayload; jwt.verify lo tipa como JwtPayload
  // (string | JwtPayload), así que recuperamos nuestros campos con un cast seguro.
  return jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload
}
