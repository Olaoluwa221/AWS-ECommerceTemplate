import { Link } from 'react-router-dom'

export default function CtaSection({ cta }) {
  return (
    <section
      className="px-6 py-28 text-center relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--brand-accent-dark) 0%, var(--brand-accent) 50%, var(--brand-accent-light) 100%)',
      }}
    >
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{
          background: '#fff',
          filter: 'blur(80px)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-20"
        style={{
          background: 'var(--brand-surface)',
          filter: 'blur(60px)',
          transform: 'translate(50%, 50%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2
          className="text-5xl md:text-6xl font-bold text-white mb-6"
          style={{
            fontFamily: 'var(--font-brand-display)',
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          {cta.heading}
        </h2>
        <p className="text-orange-50 mb-10 text-lg max-w-xl mx-auto">{cta.description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="bg-white font-bold px-10 py-4 rounded-md text-base hover:scale-[1.02] transition-all duration-200 shadow-2xl inline-flex items-center justify-center gap-2 group"
            style={{ color: 'var(--brand-primary)' }}
          >
            {cta.button}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
