import { Router } from 'express'
import { z } from 'zod'
import {
  listAllProducts,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  listOptionGroupsForAdmin,
  createOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  createOption,
  updateOption,
  deleteOption,
  type ProductInput,
  type OptionGroupInput,
  type OptionInput,
} from '../../repositories/products'

export const adminProductsRouter = Router()

const idSchema = z.object({ id: z.coerce.number().int().positive() })

const productSchema = z.object({
  name: z.string().trim().min(1).max(150),
  categoryId: z.number().int().positive(),
  description: z.string().trim().max(500).nullable(),
  image: z.string().trim().max(1000).nullable(),
  price: z.number().nonnegative(),
  active: z.boolean(),
})

const optionGroupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  minSelect: z.number().int().nonnegative(),
  maxSelect: z.number().int().nonnegative(),
  sortOrder: z.number().int().nonnegative(),
  active: z.boolean(),
})

const optionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  priceDelta: z.number().nonnegative(),
  sortOrder: z.number().int().nonnegative(),
  active: z.boolean(),
})

// GET /api/admin/products — todos los productos (activos e inactivos).
adminProductsRouter.get('/', async (_req, res) => {
  const products = await listAllProducts()
  res.json(products)
})

// POST /api/admin/products — crea un producto.
adminProductsRouter.post('/', async (req, res) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos del producto inválidos' })
    return
  }
  const input: ProductInput = { ...parsed.data }
  const { id } = await createProduct(input)
  res.status(201).json({ id })
})

// PATCH /api/admin/products/:id — actualiza un producto.
adminProductsRouter.patch('/:id', async (req, res) => {
  const idParsed = idSchema.safeParse(req.params)
  const bodyParsed = productSchema.safeParse(req.body)
  if (!idParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: 'Datos del producto inválidos' })
    return
  }
  const updated = await updateProduct(idParsed.data.id, bodyParsed.data)
  if (!updated) {
    res.status(404).json({ error: 'Producto no encontrado' })
    return
  }
  res.json({ id: idParsed.data.id })
})

// GET /api/admin/products/:id — detalle del producto (para edición).
adminProductsRouter.get('/:id', async (req, res) => {
  const parsed = idSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetro "id" inválido' })
    return
  }
  const product = await getProductByIdAdmin(parsed.data.id)
  if (!product) {
    res.status(404).json({ error: 'Producto no encontrado' })
    return
  }
  res.json(product)
})

// GET /api/admin/products/:id/option-groups — grupos y opciones (para edición).
adminProductsRouter.get('/:id/option-groups', async (req, res) => {
  const parsed = idSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetro "id" inválido' })
    return
  }
  const groups = await listOptionGroupsForAdmin(parsed.data.id)
  res.json(groups)
})

// POST /api/admin/products/:id/option-groups — crea un grupo de opciones.
adminProductsRouter.post('/:id/option-groups', async (req, res) => {
  const idParsed = idSchema.safeParse(req.params)
  const bodyParsed = optionGroupSchema.safeParse(req.body)
  if (!idParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: 'Datos del grupo inválidos' })
    return
  }
  const input: OptionGroupInput = { ...bodyParsed.data }
  const { id } = await createOptionGroup(idParsed.data.id, input)
  res.status(201).json({ id })
})

// PATCH /api/admin/products/option-groups/:groupId — actualiza un grupo.
adminProductsRouter.patch('/option-groups/:id', async (req, res) => {
  const idParsed = idSchema.safeParse(req.params)
  const bodyParsed = optionGroupSchema.safeParse(req.body)
  if (!idParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: 'Datos del grupo inválidos' })
    return
  }
  const updated = await updateOptionGroup(idParsed.data.id, bodyParsed.data)
  if (!updated) {
    res.status(404).json({ error: 'Grupo no encontrado' })
    return
  }
  res.json({ id: idParsed.data.id })
})

// DELETE /api/admin/products/option-groups/:groupId — elimina un grupo.
adminProductsRouter.delete('/option-groups/:id', async (req, res) => {
  const parsed = idSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetro "id" inválido' })
    return
  }
  const deleted = await deleteOptionGroup(parsed.data.id)
  if (!deleted) {
    res.status(404).json({ error: 'Grupo no encontrado' })
    return
  }
  res.status(204).end()
})

// POST /api/admin/products/option-groups/:groupId/options — crea una opción.
adminProductsRouter.post('/option-groups/:id/options', async (req, res) => {
  const idParsed = idSchema.safeParse(req.params)
  const bodyParsed = optionSchema.safeParse(req.body)
  if (!idParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: 'Datos de la opción inválidos' })
    return
  }
  const input: OptionInput = { ...bodyParsed.data }
  const { id } = await createOption(idParsed.data.id, input)
  res.status(201).json({ id })
})

// PATCH /api/admin/products/options/:optionId — actualiza una opción.
adminProductsRouter.patch('/options/:id', async (req, res) => {
  const idParsed = idSchema.safeParse(req.params)
  const bodyParsed = optionSchema.safeParse(req.body)
  if (!idParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: 'Datos de la opción inválidos' })
    return
  }
  const updated = await updateOption(idParsed.data.id, bodyParsed.data)
  if (!updated) {
    res.status(404).json({ error: 'Opción no encontrada' })
    return
  }
  res.json({ id: idParsed.data.id })
})

// DELETE /api/admin/products/options/:optionId — elimina una opción.
adminProductsRouter.delete('/options/:id', async (req, res) => {
  const parsed = idSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetro "id" inválido' })
    return
  }
  const deleted = await deleteOption(parsed.data.id)
  if (!deleted) {
    res.status(404).json({ error: 'Opción no encontrada' })
    return
  }
  res.status(204).end()
})
