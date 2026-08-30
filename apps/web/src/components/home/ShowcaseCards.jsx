import { formatCurrency } from '../../utils/formatCurrency'

const CARD_VARIANTS = {
  light: {
    wrapperClass: 'absolute top-8 right-12 w-72 p-6 rounded-md shadow-2xl rotate-[8deg] hover:rotate-[6deg] transition-transform duration-500',
    wrapperStyle: { backgroundColor: 'var(--brand-surface)' },
    labelClass: 'text-[10px] tracking-[0.3em] mb-3 font-semibold',
    labelStyle: { color: 'var(--brand-accent)' },
    nameClass: 'text-2xl font-bold mb-1',
    nameStyle: {
      color: 'var(--brand-primary)',
      fontFamily: 'var(--font-brand-display)',
      letterSpacing: '0.02em',
    },
    descriptionClass: 'text-xs text-gray-500 mb-4',
    footerClass: 'flex items-center justify-between border-t pt-3',
    footerStyle: { borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' },
    optionClass: 'text-[10px] px-1.5 py-0.5 rounded',
    optionStyle: {
      backgroundColor: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
      color: 'var(--brand-primary)',
    },
    priceClass: 'text-base font-bold',
    priceStyle: { color: 'var(--brand-primary)' },
  },
  accent: {
    wrapperClass: 'absolute top-32 right-0 w-72 p-6 rounded-md shadow-2xl -rotate-[6deg] hover:-rotate-[4deg] transition-transform duration-500',
    wrapperStyle: { backgroundColor: 'var(--brand-accent)' },
    labelClass: 'text-[10px] tracking-[0.3em] mb-3 font-semibold text-orange-100',
    nameClass: 'text-2xl font-bold mb-1 text-white',
    nameStyle: {
      fontFamily: 'var(--font-brand-display)',
      letterSpacing: '0.02em',
    },
    descriptionClass: 'text-xs text-orange-100 mb-4',
    footerClass: 'flex items-center justify-between border-t border-white/20 pt-3',
    optionClass: 'text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white',
    priceClass: 'text-base font-bold text-white',
  },
  dark: {
    wrapperClass: 'absolute bottom-0 right-25 w-72 p-6 rounded-md shadow-2xl rotate-[3deg] hover:rotate-[1deg] transition-transform duration-500',
    wrapperStyle: {
      backgroundColor: 'var(--brand-primary)',
      border: '1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)',
    },
    labelClass: 'text-[10px] tracking-[0.3em] mb-2 font-semibold',
    labelStyle: { color: 'var(--brand-accent-soft)' },
    nameClass: 'text-xl font-bold mb-1 text-white',
    nameStyle: {
      fontFamily: 'var(--font-brand-display)',
      letterSpacing: '0.02em',
    },
    descriptionClass: 'text-xs text-blue-200 mb-3',
    footerClass: 'flex items-center justify-between border-t border-white/20 pt-3',
    optionClass: 'text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white',
    priceClass: 'text-sm font-bold text-white',
  },
}

function ShowcaseCard({ card }) {
  const variant = CARD_VARIANTS[card.variant] ?? CARD_VARIANTS.light
  const hasOptions = card.options?.length > 0
  

  return (
    <div className={variant.wrapperClass} style={variant.wrapperStyle}>
      <div className={variant.labelClass} style={variant.labelStyle}>
        {card.label}
      </div>
      <div className={variant.nameClass} style={variant.nameStyle}>
        {card.name}
      </div>
      <div className={variant.descriptionClass}>{card.description}</div>

      <div className={variant.footerClass} style={variant.footerStyle}>
          {hasOptions && (
            <div className="flex gap-1">
              {card.options.map((option) => (
                <span
                  key={option}
                  className={variant.optionClass}
                  style={variant.optionStyle}
                >
                  {option}
                </span>
              ))}
            </div>
          )}
          <div
            className={`${variant.priceClass}${hasOptions ? '' : ' ml-auto'}`}
            style={variant.priceStyle}
          >
            {formatCurrency(card.price)}
          </div>
        </div>
    </div>
  )
}

export default function ShowcaseCards({ cards }) {
  return (
    <div
      className="md:col-span-5 relative h-[420px] hidden md:block"
      style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}
    >
      {cards.map((card, index) => (
        <ShowcaseCard key={`${card.variant}-${card.name}-${index}`} card={card} />
      ))}
    </div>
  )
}
