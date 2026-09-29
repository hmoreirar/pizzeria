import { Router } from 'express'
import { dashboardRouter } from './dashboard'
import { adminOrdersRouter } from './orders'
import { adminProductsRouter } from './products'
import { adminCategoriesRouter } from './categories'

// Router de administración. Se monta en /api/admin con requireAdmin ya aplicado.
export const adminRouter = Router()

adminRouter.use('/dashboard', dashboardRouter)
adminRouter.use('/orders', adminOrdersRouter)
adminRouter.use('/products', adminProductsRouter)
adminRouter.use('/categories', adminCategoriesRouter)
