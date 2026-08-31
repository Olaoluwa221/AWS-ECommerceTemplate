export const routes = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    unsubscribe: (token) => `/auth/unsubscribe/${token}`,
    updateProfile: '/auth/update-profile',
    updatePassword: '/auth/update-password',
    marketingOptIn: '/auth/marketing-opt-in',
    users: '/auth/users',
    userRole: (userId) => `/auth/users/${userId}/role`,
    optedInCount: '/auth/opted-in-count',
    sendPromotional: '/auth/send-promotional',
  },
  cart: {
    base: '/cart',
    items: '/cart/items',
    itemById: (variantId) => `/cart/items/${variantId}`,
  },
  products: {
    list: '/products',
    byId: (id) => `/products/${id}`,
    variantById: (variantId) => `/products/variants/${variantId}`,
    productTypes: '/producttypes',
    productTypeById: (id) => `/producttypes/${id}`,
    createVariant: (productId) => `/products/${productId}/variants`,
  },
  orders: {
    list: '/orders',
    all: '/orders/all',
    checkout: '/orders/checkout',
    byId: (orderId) => `/orders/${orderId}`,
    statusById: (orderId) => `/orders/${orderId}/status`,
    regenerateArtwork: (orderId, variantId) => `/orders/${orderId}/regenerate-artwork-token/${variantId}`,
  },
  payments: {
    createIntent: '/payments/create-intent',
  },
  images: {
    upload: '/images/upload',
    assignProduct: (productId) => `/images/products/${productId}/assign`,
    setPrimaryProduct: (productId, pictureId) => `/images/products/${productId}/primary/${pictureId}`,
    deleteProductPicture: (productId, pictureId) => `/images/products/${productId}/pictures/${pictureId}`,
    artworkUrl: (orderId, variantId) => `/images/orders/${orderId}/artwork/${variantId}/url`,
  },
}

export default routes
