import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { routes } from '../api/routes'
import siteConfig from '../config/siteConfig'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    marketingOptIn: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await api.post(routes.auth.register, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        marketingOptIn: form.marketingOptIn
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div style={{ backgroundColor: 'var(--brand-primary)' }} className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <span className="text-white font-bold text-xl tracking-wide">{siteConfig.brand.name}</span>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            {siteConfig.auth.register.headline}
          </h2>
          <p className="text-blue-200 text-lg">
            {siteConfig.auth.register.description}
          </p>
        </div>
        <p className="text-blue-300 text-sm">{siteConfig.auth.register.footerText}</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>Create an account</h1>
          <p className="text-gray-500 mb-8">Fill in your details to get started</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-primary)' }}>First name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  placeholder="John"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-primary)' }}>Last name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-primary)' }}>Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-primary)' }}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-primary)' }}>Confirm password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketingOptIn"
                checked={form.marketingOptIn}
                onChange={e => setForm({ ...form, marketingOptIn: e.target.checked })}
                className="mt-1 w-4 h-4 accent-orange-500"
              />
              <label htmlFor="marketingOptIn" className="text-sm text-gray-500">
                I'd like to receive promotional emails about new products and special offers
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: 'var(--brand-accent)' }}
              className="w-full text-white py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--brand-accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}