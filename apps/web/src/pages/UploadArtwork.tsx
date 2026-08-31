import { useState, useEffect, type ChangeEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

type ErrorStatus = 'notfound' | 'used' | 'invalidated' | 'orderclosed' | 'error'
type TokenInfo = {
  orderId?: string | number
  productName?: string
  size?: string
  quantity?: number
}

export default function UploadArtwork() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [errorStatus, setErrorStatus] = useState<ErrorStatus | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!token) {
        setErrorStatus('notfound')
        setErrorMessage('This upload link is not valid.')
        setLoading(false)
        return
      }

      try {
        const res = await api.get(`/artwork-upload/${token}`)
        const responseData = (res.data ?? {}) as {
          status?: string
          message?: string
          orderId?: string | number
          productName?: string
          size?: string
          quantity?: number
        }

        if (responseData.status === 'valid') {
          setTokenInfo(responseData)
        } else {
          setErrorStatus((responseData.status as ErrorStatus | undefined) ?? 'error')
          setErrorMessage(responseData.message ?? 'This upload link is not valid.')
        }
      } catch (err: unknown) {
        const errorResponse = err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { status?: number; data?: { message?: string } } }).response ?? {})
          : {}

        if (errorResponse.status === 404) {
          setErrorStatus('notfound')
          setErrorMessage(errorResponse.data?.message ?? 'This upload link is not valid.')
        } else {
          setErrorStatus('error')
          setErrorMessage('Something went wrong loading this page.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTokenInfo()
  }, [token])

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setUploading(true)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post(`/artwork-upload/${token}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploaded(true)
    } catch (err: unknown) {
      const errorResponse = err && typeof err === 'object' && 'response' in err
        ? ((err as { response?: { data?: string } }).response?.data ?? 'Upload failed. Please try again.')
        : 'Upload failed. Please try again.'

      setUploadError(typeof errorResponse === 'string' ? errorResponse : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (errorStatus) {
    const icon = errorStatus === 'used' ? '✓' : '⚠️'
    const iconBg = errorStatus === 'used' ? '#10b981' : '#f59e0b'
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-white"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>
            {errorStatus === 'used' ? 'Already uploaded' : 'Link unavailable'}
          </h2>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <Link to="/" style={{ color: 'var(--brand-accent)' }} className="text-sm font-medium hover:opacity-80">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  if (!tokenInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>Upload your artwork</h2>
          <p className="text-sm text-gray-500">
            Order <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>#{tokenInfo.orderId}</span>
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <p className="font-semibold" style={{ color: 'var(--brand-primary)' }}>{tokenInfo.productName}</p>
          <p className="text-sm text-gray-500 mt-1">
            Size: {tokenInfo.size} · Quantity: {tokenInfo.quantity}
          </p>
        </div>

        {uploaded ? (
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-white"
              style={{ backgroundColor: '#10b981' }}
            >
              ✓
            </div>
            <p className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>Artwork uploaded!</p>
            <p className="text-sm text-gray-500">We'll get started on your order right away.</p>
          </div>
        ) : (
          <>
            <label
              className={`flex flex-col items-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                uploading
                  ? 'border-gray-200 text-gray-400'
                  : 'border-orange-300 text-orange-500 hover:border-orange-500 hover:bg-orange-50'
              }`}
            >
              <span className="text-3xl">📎</span>
              <span className="font-medium">
                {uploading ? 'Uploading...' : 'Choose file to upload'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-gray-400 text-xs text-center mt-3">
              JPEG, PNG, WebP, GIF or PDF — max 20MB
            </p>
            {uploadError && <p className="text-red-500 text-sm mt-3 text-center">{uploadError}</p>}
          </>
        )}
      </div>
    </div>
  )
}
