import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { routes } from '../api/routes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'
import type { Product, ProductVariant } from '../types/domain'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/products')
        return
      }
      try {
        const res = await api.get(routes.products.byId(id))
        const nextProduct = res.data as Product
        const nextVariants = nextProduct.variants ?? []
        setProduct(nextProduct)
        if (nextVariants.length > 0) {
          setSelectedVariant(nextVariants[0])
        }
        setSelectedImage(nextProduct.primaryImageLink || nextProduct.pictures?.[0]?.link || null)
      } catch {
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  const productImages = product?.pictures?.map((pic) => pic.link).filter((link): link is string => Boolean(link)) ?? []

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) {
      showToast('Please select a size', 'error')
      return
    }
    setAddingToCart(true)
    try {
      if (user) {
        await api.post(routes.cart.items, {
          variantId: selectedVariant.variantId,
          quantity
        })
      } else {
        const existing = JSON.parse(localStorage.getItem('guestCart') || '{"items":[],"total":0}') as { items: Array<{ variantId: string | number; quantity: number; price: number; productName: string; size: string; subtotal: number; imageLink?: string }>; total: number }
        const itemIndex = existing.items.findIndex(i => i.variantId === selectedVariant.variantId)
        if (itemIndex >= 0) {
          existing.items[itemIndex].quantity += quantity
          existing.items[itemIndex].subtotal = existing.items[itemIndex].price * existing.items[itemIndex].quantity
        } else {
          existing.items.push({
            variantId: selectedVariant.variantId,
            productName: product.productName,
            size: selectedVariant.size,
            price: selectedVariant.price,
            quantity,
            subtotal: selectedVariant.price * quantity,
            imageLink: product.primaryImageLink
          })
        }
        existing.total = existing.items.reduce((sum: number, i) => sum + i.price * i.quantity, 0)
        localStorage.setItem('guestCart', JSON.stringify(existing))
      }
      showToast('Added to cart!')
    } catch {
      showToast('Failed to add to cart', 'error')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-400 text-lg">Loading...</div>
    </div>
  )

  if (!product) return null

  const safeVariants = product.variants ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Back */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-8"
        >
          ← Back to products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Images */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4 aspect-square flex items-center justify-center">
              {selectedImage ? (
                <img src={selectedImage} alt={product.productName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">🖨️</span>
              )}
            </div>

            {/* Thumbnail strip */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((imageLink, index) => (
                  <button
                    key={`${imageLink}-${index}`}
                    onClick={() => setSelectedImage(imageLink)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === imageLink ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <img src={imageLink} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-xs font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
              {product.productType}
            </span>

            <h1 className="text-3xl font-bold mt-3 mb-3" style={{ color: 'var(--brand-primary)' }}>
              {product.productName}
            </h1>

            {product.description && (
              <p className="text-gray-500 mb-6 leading-relaxed">{product.description}</p>
            )}

            {/* Price */}
            {selectedVariant && (
              <div className="text-4xl font-bold mb-6" style={{ color: 'var(--brand-accent)' }}>
                {formatCurrency(selectedVariant.price)}
              </div>
            )}

            {/* Variant selector */}
            {safeVariants.length > 0 ? (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>
                  Size / Option
                </label>
                <div className="flex flex-wrap gap-3">
                  {safeVariants.map(variant => (
                    <button
                      key={variant.variantId}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${selectedVariant?.variantId === variant.variantId
                        ? 'text-white border-orange-500'
                        : 'border-gray-200 text-gray-600 hover:border-orange-400'
                        }`}
                      style={selectedVariant?.variantId === variant.variantId ? { backgroundColor: 'var(--brand-accent)' } : {}}
                    >
                      {variant.size}
                      <span className="ml-2 opacity-75">{formatCurrency(variant.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                No variants available yet — check back soon.
              </div>
            )}

            {/* Quantity */}
            {safeVariants.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: 'var(--brand-primary)' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariant}
              style={{ backgroundColor: 'var(--brand-accent)' }}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg"
            >
              {addingToCart ? 'Adding...' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}