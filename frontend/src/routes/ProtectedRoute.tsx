import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/auth'

interface ProtectedRouteProps {
  allowedRoles: Role[]
  redirectTo: string
}

// Equivalente web aos _layout.tsx protegidos do app Expo: se não houver
// usuário logado, ou o usuário logado tiver o role errado, manda para
// a tela de login correspondente em vez de renderizar o conteúdo.
export function ProtectedRoute({ allowedRoles, redirectTo }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#8b949e', fontFamily: 'var(--font-sans)' }}>
        Carregando...
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
