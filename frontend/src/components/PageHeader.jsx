export default function PageHeader({ badge, title, subtitle, accent = '#F59E0B' }) {
  return (
    <div className="mb-8">
      {badge && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}40`, color: accent }}
        >
          {badge}
        </div>
      )}
      <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      {subtitle && <p className="text-sm" style={{ color: 'var(--text-2)' }}>{subtitle}</p>}
    </div>
  )
}
