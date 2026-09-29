import { Router } from 'express'
import { z } from 'zod'
import { verifyPassword } from '../auth/password'
import { signToken } from '../auth/token'
import { getUserByEmail } from '../repositories/users'

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/login — autentica al administrador y devuelve un token.
authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: 'Credenciales inválidas' })
    return
  }

  const user = await getUserByEmail(parsed.data.email)
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    res.status(401).json({ error: 'Credenciales inválidas' })
    return
  }

  const token = signToken({ sub: user.id, role: user.role })
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })
})
