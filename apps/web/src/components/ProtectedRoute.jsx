import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, adminOnly = false }) {
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

  return children
}

export function AdminRoute({ children }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>
}

export function GuestOnlyRoute({ children }) {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50" />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
