import { Link } from 'react-router-dom'

type SiteFooterProps = {
  brand: {
    shortName: string
    legalName: string
    locationLabel: string
  }
}

export default function SiteFooter({ brand }: SiteFooterProps) {
  return (
    <footer style={{ backgroundColor: 'var(--brand-primary-dark)' }} className="px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8">
          <div>
            <div
              className="text-3xl font-bold text-white"
              style={{
                fontFamily: 'var(--font-brand-display)',
                letterSpacing: '0.02em',
                lineHeight: 0.9,
              }}
            >
              {brand.shortName}
              <span style={{ color: 'var(--brand-accent)' }}>.</span>
            </div>
            <div
              className="text-xs font-medium tracking-[0.25em] uppercase mt-1"
              style={{ color: 'var(--brand-muted)' }}
            >
              {brand.locationLabel}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <Link
              to="/products"
              className="text-sm transition-colors hover:text-white"
              style={{ color: 'var(--brand-muted)' }}
            >
              Shop
            </Link>
            <Link
              to="/register"
              className="text-sm transition-colors hover:text-white"
              style={{ color: 'var(--brand-muted)' }}
            >
              Register
            </Link>
            <Link
              to="/login"
              className="text-sm transition-colors hover:text-white"
              style={{ color: 'var(--brand-muted)' }}
            >
              Login
            </Link>
          </div>
        </div>

        <div
          className="pt-8 border-t flex flex-col md:flex-row justify-between gap-4 text-xs"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            color: 'var(--brand-muted-dark)',
          }}
        >
          <p>© {new Date().getFullYear()} {brand.legalName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
