import siteConfig from '../config/siteConfig'

export function formatCurrency(value) {
  return new Intl.NumberFormat(siteConfig.commerce.locale, {
    style: 'currency',
    currency: siteConfig.commerce.currency,
  }).format(value)
}
