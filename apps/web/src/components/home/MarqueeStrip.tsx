type MarqueeStripProps = {
  items: string[]
}

export default function MarqueeStrip({ items }: MarqueeStripProps) {
  return (
    <div
      className="overflow-hidden border-b"
      style={{
        backgroundColor: 'var(--brand-primary)',
        borderColor: 'var(--brand-accent)',
      }}
    >
      <div className="flex whitespace-nowrap py-2.5 marquee">
        {[...Array(8)].map((_, groupIndex) => (
          <div
            key={groupIndex}
            className="flex items-center gap-6 px-6 text-sm font-medium tracking-widest uppercase"
            style={{ color: 'var(--brand-surface)' }}
          >
            {items.map((item, itemIndex) => (
              <span key={`${item}-${itemIndex}`} className="contents">
                <span>{item}</span>
                <span style={{ color: 'var(--brand-accent)' }}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
