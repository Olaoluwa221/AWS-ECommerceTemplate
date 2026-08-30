import { useAuth } from '../context/AuthContext'
import siteConfig from '../config/siteConfig'
import MarqueeStrip from '../components/home/MarqueeStrip'
import HeroSection from '../components/home/HeroSection'
import CatalogSection from '../components/home/CatalogSection'
import ManifestoSection from '../components/home/ManifestoSection'
import CtaSection from '../components/home/CtaSection'
import SiteFooter from '../components/SiteFooter'
import '../components/home/home.css'

export default function Home() {
  const { user } = useAuth()
  const { brand, home } = siteConfig

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: 'var(--brand-surface)',
        fontFamily: 'var(--font-brand-body)',
      }}
    >
      <MarqueeStrip items={home.marqueeItems} />
      <HeroSection
        brand={brand}
        hero={home.hero}
        showcaseCards={home.showcaseCards}
        isAuthenticated={Boolean(user)}
      />
      <CatalogSection catalog={home.catalog} />
      <ManifestoSection manifesto={home.manifesto} />
      <CtaSection cta={home.cta} />
      <SiteFooter brand={brand} />
    </div>
  )
}
