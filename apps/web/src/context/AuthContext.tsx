import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

import api, { clearAuthToken, setAuthToken } from '../api/axios'
import { routes } from '../api/routes'
import type { AuthUser, LoginPayload } from '../types/domain'

type AuthContextValue = {
  user: AuthUser | null
  login: (_payload: LoginPayload | AuthUser | null | undefined) => void
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
        const res = await api.get(routes.auth.me)

        if (!cancelled && res.data.user) {
          setUser(res.data.user as AuthUser)
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setUser(null)
        }

        const status = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined

        if (status !== 400) {
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

  const login = (data: LoginPayload | AuthUser | null | undefined) => {
    const token = data && 'token' in data ? data.token : undefined
    const accessToken = data && 'accessToken' in data ? data.accessToken : undefined
    const candidateUser = data && 'user' in data ? data.user : data
    const nextUser = candidateUser && typeof candidateUser === 'object' ? (candidateUser as AuthUser) : null

    if (token || accessToken) {
      setAuthToken(String(token ?? accessToken))
    }

    setUser(nextUser)
  }

  const logout = async () => {
    try {
      await api.post(routes.auth.logout)
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      clearAuthToken()
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