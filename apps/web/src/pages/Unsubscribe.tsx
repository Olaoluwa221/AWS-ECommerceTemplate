import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { routes } from '../api/routes'

export default function Unsubscribe() {
  const { token } = useParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setMessage('This unsubscribe link is not valid.')
        setStatus('error')
        return
      }

      try {
        const res = await api.post(routes.auth.unsubscribe(token))
        const responseData = (res.data ?? {}) as { email?: string; message?: string }
        setEmail(responseData.email ?? null)
        setMessage(responseData.message ?? 'You have been unsubscribed.')
        setStatus('success')
      } catch (err: unknown) {
        const responseData = err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data ?? {})
          : {}
        setMessage(responseData.message ?? 'This unsubscribe link is not valid.')
        setStatus('error')
      }
    }
    unsubscribe()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <p className="text-gray-400">Unsubscribing...</p>
        )}

        {status === 'success' && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-white"
              style={{ backgroundColor: '#10b981' }}
            >
              ✓
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>Unsubscribed</h2>
            <p className="text-gray-500 mb-2">{message}</p>
            {email && (
              <p className="text-sm text-gray-400 mb-6">
                <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>{email}</span> will no longer receive marketing emails from us.
              </p>
            )}
            <p className="text-xs text-gray-400 mb-6">
              You'll still receive transactional emails (order confirmations, shipping updates, password resets).
            </p>
            <Link to="/" style={{ color: 'var(--brand-accent)' }} className="text-sm font-medium hover:opacity-80">
              Back to home
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-white"
              style={{ backgroundColor: '#f59e0b' }}
            >
              ⚠️
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>Link not valid</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <p className="text-xs text-gray-400 mb-6">
              You can also manage marketing preferences from your profile page if you have an account.
            </p>
            <Link to="/" style={{ color: 'var(--brand-accent)' }} className="text-sm font-medium hover:opacity-80">
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
