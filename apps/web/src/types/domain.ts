export type UserRole = 'customer' | 'admin'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'readyforpickup' | 'pickedup' | 'cancelled'
export type DeliveryMethod = 'shipping' | 'pickup'

export type ProductType = {
  productTypeId: string | number
  typeName: string
  name?: string
}

export type ProductVariant = {
  variantId: string | number
  size: string
  price: number
}

export type ProductPicture = {
  pictureId: string | number
  link: string
  isPrimary?: boolean
}

export type Product = {
  productId: string | number
  productName: string
  description?: string
  productType?: string
  productTypeId?: string | number
  requiresArtwork?: boolean
  primaryImageLink?: string
  variants?: ProductVariant[]
  pictures?: ProductPicture[]
}

export type CartItem = {
  variantId: string | number
  productName: string
  size: string
  price: number
  quantity: number
  subtotal: number
  imageLink?: string
  requiresArtwork?: boolean
}

export type CartData = {
  items: CartItem[]
  total: number
}

export type OrderItem = {
  productName?: string
  name?: string
  size?: string
  quantity?: number
  subtotal?: number
  price?: number
  variantId?: string | number
  VariantId?: string | number
  artworkId?: string | number | null
  ArtworkId?: string | number | null
  requiresArtwork?: boolean
  RequiresArtwork?: boolean
}

export type Order = {
  id?: string | number
  orderId: string | number
  dateOrdered?: string
  total?: number
  subtotal?: number
  shippingCost?: number
  taxAmount?: number
  orderStatus?: OrderStatus
  status?: OrderStatus
  deliveryMethod?: DeliveryMethod
  contactFirstName?: string
  contactLastName?: string
  contactEmail?: string
  contactPhone?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  items?: OrderItem[]
}

export type UserRecord = {
  userId: string | number
  email: string
  firstName?: string
  lastName?: string
  userType: UserRole
  orderCount?: number
  marketingOptIn?: boolean
}

export type ProfileUser = {
  id?: string | number
  email?: string
  firstName?: string
  lastName?: string
  marketingOptIn?: boolean
  userType?: UserRole | string
  [key: string]: unknown
}

export type AuthUser = ProfileUser & {
  [key: string]: unknown
}

export type LoginPayload = {
  token?: string
  accessToken?: string
  user?: AuthUser
  [key: string]: unknown
}

export type CheckoutFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
}

export type TaxQuote = {
  tax: number
  total: number
}
