import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

import api from '../api/axios'
import { routes } from '../api/routes'
import type { AuthUser } from '../types/domain'
import axios from 'axios'

type AuthContextValue = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => Promise<void>
  authLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      try {
        const res =
          await api.get<AuthUser>(routes.auth.me)

        if (!cancelled) {
          setUser(res.data)
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setUser(null)
        }

        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          console.error('Error restoring session:', error)
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  const login = (user: AuthUser) => {
    setUser(user)
  }

  const logout = async () => {
    try {
      await api.post(routes.auth.logout)
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}