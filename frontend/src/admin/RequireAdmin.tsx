import { Navigate, Outlet } from 'react-router'
import { isAuthenticated } from './auth'

// Guard de rutas administrativas. La autorización real está en el backend;
// esto solo evita mostrar la UI a quien no ha iniciado sesión.
export function RequireAdmin() {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }
  return <Outlet />
}
