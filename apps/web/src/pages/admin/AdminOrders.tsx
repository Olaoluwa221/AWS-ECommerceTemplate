import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { routes } from '../../api/routes'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import type { DeliveryMethod, Order, OrderStatus } from '../../types/domain'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  processing: 'bg-blue-50 text-blue-600 border-blue-200',
  shipped: 'bg-purple-50 text-purple-600 border-purple-200',
  delivered: 'bg-green-50 text-green-600 border-green-200',
  readyforpickup: 'bg-orange-50 text-orange-600 border-orange-200',
  pickedup: 'bg-green-50 text-green-600 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

const allStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'readyforpickup', 'pickedup', 'cancelled']
const shippingStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const pickupStatuses: OrderStatus[] = ['pending', 'processing', 'readyforpickup', 'pickedup', 'cancelled']

const getStatuses = (deliveryMethod?: DeliveryMethod): OrderStatus[] =>
  (deliveryMethod ?? 'shipping') === 'pickup' ? pickupStatuses : shippingStatuses

const formatStatus = (status?: string) => {
  if (!status) return 'Pending'
  return status.replace('readyforpickup', 'Ready for Pickup').replace('pickedup', 'Picked Up')
}

export default function AdminOrders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get(routes.orders.all)
      setOrders((res.data ?? []) as Order[])
    } catch {
      showToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleViewArtwork = async (orderId: string | number, variantId: string | number) => {
    try {
      const res = await api.get(routes.images.artworkUrl(orderId, variantId))
      window.open(res.data.url, '_blank')
    } catch {
      showToast('Failed to load artwork', 'error')
    }
  }

  const handleRegenerateLink = async (orderId: string | number, variantId: string | number) => {
    if (!confirm('Send a new artwork upload link to the customer? Any previous link will stop working.')) return
    try {
      await api.post(routes.orders.regenerateArtwork(orderId, variantId))
      showToast('New upload link emailed to customer')
    } catch {
      showToast('Failed to send new link', 'error')
    }
  }

  const handleStatusUpdate = async (orderId: string | number, newStatus: OrderStatus) => {
    try {
      await api.put(routes.orders.statusById(orderId), { orderStatus: newStatus })
      showToast('Order status updated')
      fetchOrders()
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : prev)
      }
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>Orders</h1>
            <p className="text-gray-500 mt-1">{orders.length} total orders</p>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['all', ...allStatuses].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${filterStatus === status
                ? 'text-white shadow-md scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-400 hover:text-orange-500'
                }`}
              style={filterStatus === status ? { backgroundColor: 'var(--brand-accent)' } : {}}
            >
              {formatStatus(status)}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Orders list */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--brand-primary)' }}>No orders found</h3>
                <p className="text-gray-500">No orders match this filter</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }} className="border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, i) => (
                    <tr
                      key={order.orderId}
                      onClick={async () => {
                        try {
                          const res = await api.get(routes.orders.all)
                          const fresh = (res.data ?? []).find((o: Order) => o.orderId === order.orderId)
                          setSelectedOrder((fresh ?? order) as Order)
                        } catch {
                          setSelectedOrder(order)
                        }
                      }}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedOrder?.orderId === order.orderId ? 'bg-orange-50' : 'hover:bg-gray-50'
                        } ${i === filtered.length - 1 ? 'border-0' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-sm" style={{ color: 'var(--brand-primary)' }}>
                          #{order.orderId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.dateOrdered ? new Date(order.dateOrdered).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${(order.deliveryMethod ?? 'shipping') === 'pickup'
                          ? 'bg-orange-50 text-orange-600 border-orange-200'
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                          {(order.deliveryMethod ?? 'shipping') === 'pickup' ? '🏪 Pickup' : '🚚 Shipping'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--brand-accent)' }}>
                        {formatCurrency(Number(order.total ?? 0))}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusColors[order.orderStatus ?? 'pending'] || statusColors.pending}`}>
                          {formatStatus(order.orderStatus ?? 'pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <select
                            value={order.orderStatus ?? 'pending'}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleStatusUpdate(order.orderId, e.target.value as OrderStatus)
                            }}
                            onClick={e => e.stopPropagation()}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            {getStatuses(order.deliveryMethod ?? 'shipping').map(s => (
                              <option key={s} value={s}>{formatStatus(s)}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Order detail panel */}
          {selectedOrder && (
            <div className="w-80 bg-white rounded-2xl border border-gray-200 p-6 self-start sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ color: 'var(--brand-primary)' }}>Order #{selectedOrder.orderId}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium" style={{ color: 'var(--brand-primary)' }}>
                    {selectedOrder.dateOrdered ? new Date(selectedOrder.dateOrdered).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${(selectedOrder.deliveryMethod ?? 'shipping') === 'pickup'
                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                    : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                    {(selectedOrder.deliveryMethod ?? 'shipping') === 'pickup' ? '🏪 Pickup' : '🚚 Shipping'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusColors[selectedOrder.orderStatus ?? 'pending'] || statusColors.pending}`}>
                    {formatStatus(selectedOrder.orderStatus ?? 'pending')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span style={{ color: 'var(--brand-primary)' }}>{formatCurrency(Number(selectedOrder.subtotal ?? selectedOrder.total ?? 0))}</span>
                </div>
                {Number(selectedOrder.shippingCost ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span style={{ color: 'var(--brand-primary)' }}>{formatCurrency(Number(selectedOrder.shippingCost ?? 0))}</span>
                  </div>
                )}
                {Number(selectedOrder.taxAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span style={{ color: 'var(--brand-primary)' }}>{formatCurrency(Number(selectedOrder.taxAmount ?? 0))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold" style={{ color: 'var(--brand-accent)' }}>{formatCurrency(Number(selectedOrder.total ?? 0))}</span>
                </div>
              </div>

              {(selectedOrder.contactFirstName || selectedOrder.contactEmail) && (
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--brand-primary)' }}>Customer</h3>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {(selectedOrder.contactFirstName || selectedOrder.contactLastName) && (
                      <p style={{ color: 'var(--brand-primary)' }} className="font-medium">
                        {[selectedOrder.contactFirstName, selectedOrder.contactLastName].filter(Boolean).join(' ')}
                      </p>
                    )}
                    {selectedOrder.contactEmail && <p>{selectedOrder.contactEmail}</p>}
                    {selectedOrder.contactPhone && <p>{selectedOrder.contactPhone}</p>}
                  </div>
                  {selectedOrder.deliveryMethod === 'shipping' && selectedOrder.shippingAddress && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>Ship to</p>
                      <p>{selectedOrder.shippingAddress}</p>
                      <p>
                        {[selectedOrder.shippingCity, selectedOrder.shippingState, selectedOrder.shippingZip]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 mb-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>Items</h3>
                <div className="space-y-3">
                  {(selectedOrder.items ?? []).map((item, i) => {
                    const hasArtwork = item.artworkId ?? item.ArtworkId
                    const artworkVariantId = item.variantId ?? item.VariantId
                    const needsArtwork = Boolean(item.requiresArtwork ?? item.RequiresArtwork) && !hasArtwork
                    const itemSubtotal = typeof item.subtotal === 'number' ? item.subtotal : 0
                    const itemName = item.productName ?? 'Item'
                    const itemSize = item.size ?? '—'
                    const itemQty = typeof item.quantity === 'number' ? item.quantity : 0
                    const canViewArtwork = typeof artworkVariantId === 'string' || typeof artworkVariantId === 'number'
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--brand-primary)' }}>{itemName}</p>
                          <p className="text-gray-400 text-xs">{itemSize} × {itemQty}</p>
                          {hasArtwork && canViewArtwork && (
                            <button
                              onClick={() => handleViewArtwork(selectedOrder.orderId, artworkVariantId as string | number)}
                              className="text-xs text-orange-500 hover:text-orange-700 transition-colors mt-0.5 block"
                            >
                              📎 View artwork
                            </button>
                          )}
                          {needsArtwork && canViewArtwork && (
                            <button
                              onClick={() => handleRegenerateLink(selectedOrder.orderId, artworkVariantId as string | number)}
                              className="text-xs text-orange-500 hover:text-orange-700 transition-colors mt-0.5 block"
                            >
                              ✉️ Resend upload link
                            </button>
                          )}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--brand-primary)' }}>{formatCurrency(itemSubtotal)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>Update status</h3>
                <div className="grid grid-cols-1 gap-2">
                  {getStatuses(selectedOrder.deliveryMethod ?? 'shipping').map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedOrder.orderId, status)}
                      disabled={selectedOrder.orderStatus === status}
                      className={`py-2 rounded-lg text-xs font-medium capitalize transition-all border ${selectedOrder.orderStatus === status
                        ? `${statusColors[status] || statusColors.pending} cursor-default`
                        : 'border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500'
                        }`}
                    >
                      {selectedOrder.orderStatus === status ? `✓ ` : ''}{formatStatus(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 