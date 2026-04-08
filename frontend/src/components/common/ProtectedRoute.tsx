import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
}: {
  children: ReactNode
  requiredRole?: string
  requiredRoles?: string[]
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />
  }

  const expectedRoles = requiredRoles?.length ? requiredRoles : requiredRole ? [requiredRole] : []
  if (expectedRoles.length > 0) {
    const hasRole = (user?.roles ?? []).some((r) =>
      expectedRoles.some((expected) => expected.toLowerCase() === r.toLowerCase())
    )
    if (!hasRole) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
