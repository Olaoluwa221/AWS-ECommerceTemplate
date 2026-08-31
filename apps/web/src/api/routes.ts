export const routes = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    unsubscribe: (token: string | number) => `/auth/unsubscribe/${token}`,
    updateProfile: '/auth/update-profile',
    updatePassword: '/auth/update-password',
    marketingOptIn: '/auth/marketing-opt-in',
    users: '/auth/users',
    userRole: (userId: string | number) => `/auth/users/${userId}/role`,
    optedInCount: '/auth/opted-in-count',
    sendPromotional: '/auth/send-promotional',
  },
  cart: {
    base: '/cart',
    items: '/cart/items',
    itemById: (variantId: string | number) => `/cart/items/${variantId}`,
  },
  products: {
    list: '/products',
    byId: (id: string | number) => `/products/${id}`,
    variantById: (variantId: string | number) => `/products/variants/${variantId}`,
    productTypes: '/producttypes',
    productTypeById: (id: string | number) => `/producttypes/${id}`,
    createVariant: (productId: string | number) => `/products/${productId}/variants`,
  },
  orders: {
    list: '/orders',
    all: '/orders/all',
    checkout: '/orders/checkout',
    byId: (orderId: string | number) => `/orders/${orderId}`,
    statusById: (orderId: string | number) => `/orders/${orderId}/status`,
    regenerateArtwork: (orderId: string | number, variantId: string | number) => `/orders/${orderId}/regenerate-artwork-token/${variantId}`,
  },
  payments: {
    createIntent: '/payments/create-intent',
  },
  images: {
    upload: '/images/upload',
    assignProduct: (productId: string | number) => `/images/products/${productId}/assign`,
    setPrimaryProduct: (productId: string | number, pictureId: string | number) => `/images/products/${productId}/primary/${pictureId}`,
    deleteProductPicture: (productId: string | number, pictureId: string | number) => `/images/products/${productId}/pictures/${pictureId}`,
    artworkUrl: (orderId: string | number, variantId: string | number) => `/images/orders/${orderId}/artwork/${variantId}/url`,
  },
} as const

export default routes
