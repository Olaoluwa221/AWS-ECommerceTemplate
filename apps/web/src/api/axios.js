import axios from 'axios'

const TOKEN_STORAGE_KEY = 'auth_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getStoredAuthToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token) {
  if (!token) {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }

  sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken()
    }

    return Promise.reject(error)
  }
)

export default api