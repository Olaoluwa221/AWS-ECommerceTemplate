import { 
  createContext, 
  useContext, 
  useState, 
  useEffect 
} from 'react'

import api, { clearAuthToken, setAuthToken } from '../api/axios'
import { routes } from '../api/routes'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {

    let cancelled = false
    
    const restoreSession = async () => {

      try {
        const res = await api.get(routes.auth.me)

        if (!cancelled && res.data.user) {
          setUser(res.data.user)
        }
      } catch (error) {

        //Treat user as logged out if the session restoration fails
        if (!cancelled) {
          setUser(null)
        }

        if(error.response?.status !== 400) {
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


  const login = (data) => {
    const token = data?.token || data?.accessToken
    const nextUser = data?.user || data

    if (token) {
      setAuthToken(token)
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
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}