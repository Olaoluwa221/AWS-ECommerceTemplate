import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

export default function CatalogSection({ catalog }) {
  const sectionRef = useFadeUp()

  return (
    <section className="px-6 py-24 max-w-7xl mx-auto" ref={sectionRef}>
      <div className="fade-up opacity-0 translate-y-8 transition-all duration-700 mb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12" style={{ backgroundColor: 'var(--brand-accent)' }} />
          <span
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: 'var(--brand-accent)' }}
          >
            {catalog.eyebrow}
          </span>
        </div>

        <h2
          className="text-5xl md:text-6xl font-bold mb-4"
          style={{
            color: 'var(--brand-primary)',
            fontFamily: 'var(--font-brand-display)',
            letterSpacing: '-0.01em',
            lineHeight: 0.95,
          }}
        >
          {catalog.headingLine1}
          <br />
          <span style={{ color: 'var(--brand-accent)' }}>{catalog.headingLine2}</span>
        </h2>

        <p className="text-gray-600 text-lg mt-6 leading-relaxed">{catalog.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {catalog.categories.map((category, index) => (
          <Link
            to="/products"
            key={category.name}
            className="fade-up opacity-0 translate-y-8 transition-all duration-700 bg-white rounded-md p-7 border hover:shadow-xl group relative overflow-hidden"
            style={{
              borderColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)',
            }}
          >
            <div
              className="absolute top-5 right-5 text-xs font-mono opacity-30 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: 'var(--brand-primary)' }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>

            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 4%, transparent) 0%, transparent 60%)',
              }}
            />

            <div className="relative z-10">
              <div className="text-4xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 inline-block origin-bottom-left">
                {category.emoji}
              </div>

              <h3
                className="text-2xl font-bold mb-2 group-hover:text-orange-600 transition-colors duration-200"
                style={{
                  color: 'var(--brand-primary)',
                  fontFamily: 'var(--font-brand-display)',
                  letterSpacing: '0.01em',
                }}
              >
                {category.name}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed">{category.description}</p>

              <div
                className="mt-5 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
                style={{ color: 'var(--brand-accent)' }}
              >
                Browse <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
