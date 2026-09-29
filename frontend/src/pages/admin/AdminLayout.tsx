import { NavLink, Outlet, useNavigate } from 'react-router'
import { clearToken } from '../../admin/auth'

export function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
    }`

  return (
    <div className="min-h-screen">
      <header className="bg-brand text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-extrabold">🍕 Admin</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold"
          >
            Salir
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            Pedidos
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            Productos
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            Categorías
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
