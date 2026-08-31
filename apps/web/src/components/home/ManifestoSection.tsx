import useFadeUp from '../../hooks/useFadeUp'

type ManifestoSectionProps = {
  manifesto: {
    eyebrow: string
    headingLine1: string
    headingLine2: string
    items: Array<{
      num: string
      title: string
      desc: string
    }>
  }
}

export default function ManifestoSection({ manifesto }: ManifestoSectionProps) {
  const sectionRef = useFadeUp()

  return (
    <section
      className="px-6 py-24"
      ref={sectionRef}
      style={{ backgroundColor: 'var(--brand-primary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="fade-up opacity-0 translate-y-8 transition-all duration-700 max-w-3xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12" style={{ backgroundColor: 'var(--brand-accent)' }} />
            <span
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: 'var(--brand-accent-soft)' }}
            >
              {manifesto.eyebrow}
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl font-bold text-white"
            style={{
              fontFamily: 'var(--font-brand-display)',
              letterSpacing: '-0.01em',
              lineHeight: 1.05,
            }}
          >
            {manifesto.headingLine1}
            <br />
            <span style={{ color: 'var(--brand-accent)' }}>{manifesto.headingLine2}</span>
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          {manifesto.items.map((item) => (
            <div
              key={item.title}
              className="fade-up opacity-0 translate-y-8 transition-all duration-700 px-8 py-12 group relative"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <div
                className="text-xs font-mono mb-6 tracking-widest"
                style={{ color: 'var(--brand-accent)' }}
              >
                {item.num}
              </div>
              <h3
                className="text-2xl font-bold mb-4 text-white"
                style={{
                  fontFamily: 'var(--font-brand-display)',
                  letterSpacing: '0.01em',
                }}
              >
                {item.title}
              </h3>
              <p className="text-blue-200 leading-relaxed text-sm">{item.desc}</p>
              <div
                className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
