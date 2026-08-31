import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

type RouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children, adminOnly = false }: RouteProps & { adminOnly?: boolean }) {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.userType !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function AdminRoute({ children }: RouteProps) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>
}

export function GuestOnlyRoute({ children }: RouteProps) {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50" />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
