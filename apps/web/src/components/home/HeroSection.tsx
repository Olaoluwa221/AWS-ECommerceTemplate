import { Link } from 'react-router-dom'
import type { BrandConfig, ShowcaseCardConfig } from '../../config/siteConfig'
import ShowcaseCards from './ShowcaseCards'

type HeroSectionProps = {
  brand: BrandConfig
  hero: {
    description: string
    primaryCta: string
    secondaryCta: string
  }
  showcaseCards: ShowcaseCardConfig[]
  isAuthenticated: boolean
}

export default function HeroSection({ brand, hero, showcaseCards, isAuthenticated }: HeroSectionProps) {
  return (
    <section
      className="relative px-6 py-24 md:py-32 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--brand-primary-dark) 0%, var(--brand-primary) 60%, var(--brand-primary-light) 100%)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'var(--brand-accent)',
          filter: 'blur(120px)',
          transform: 'translate(20%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: 'var(--brand-accent)',
          filter: 'blur(100px)',
          transform: 'translate(-30%, 30%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <h1
            className="text-white mb-2"
            style={{
              fontFamily: 'var(--font-brand-display)',
              fontSize: 'clamp(4rem, 12vw, 9rem)',
              lineHeight: 0.85,
              letterSpacing: '-0.02em',
              animation: 'fadeUp 0.6s ease 0.1s both',
            }}
          >
            {brand.wordmark.line1}
            <br />
            <span style={{ color: 'var(--brand-accent)' }}>{brand.wordmark.line2}</span>
          </h1>

          <p
            className="text-2xl md:text-3xl font-light mb-8 -mt-2"
            style={{
              color: 'var(--brand-surface)',
              fontFamily: 'var(--font-brand-display)',
              letterSpacing: '0.15em',
              animation: 'fadeUp 0.6s ease 0.15s both',
            }}
          >
            {brand.tagline}
          </p>

          <p
            className="text-blue-100 text-base md:text-lg max-w-lg mb-10 leading-relaxed"
            style={{ animation: 'fadeUp 0.6s ease 0.25s both' }}
          >
            {hero.description}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3"
            style={{ animation: 'fadeUp 0.6s ease 0.35s both' }}
          >
            <Link
              to="/products"
              style={{ backgroundColor: 'var(--brand-accent)' }}
              className="text-white px-8 py-4 rounded-md font-semibold text-base hover:opacity-90 hover:scale-[1.02] transition-all duration-200 shadow-2xl shadow-orange-900/30 inline-flex items-center justify-center gap-2 group"
            >
              {hero.primaryCta}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="text-white px-8 py-4 rounded-md font-semibold text-base border border-white/20 hover:border-white/60 hover:bg-white/5 transition-all duration-200 inline-flex items-center justify-center"
              >
                {hero.secondaryCta}
              </Link>
            )}
          </div>
        </div>

        <ShowcaseCards cards={showcaseCards} />
      </div>
    </section>
  )
}
