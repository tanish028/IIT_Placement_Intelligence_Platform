export default function StatCard({ title, value, subtitle, accent }) {
  const styles = {
    amber:   { color: '#F59E0B', glow: 'rgba(245,158,11,0.2)',   bg: 'rgba(245,158,11,0.08)'  },
    blue:    { color: '#818CF8', glow: 'rgba(139,92,246,0.2)',   bg: 'rgba(139,92,246,0.08)'  },
    green:   { color: '#34D399', glow: 'rgba(52,211,153,0.2)',   bg: 'rgba(52,211,153,0.08)'  },
    rose:    { color: '#F472B6', glow: 'rgba(244,114,182,0.2)',  bg: 'rgba(244,114,182,0.08)' },
    default: { color: '#F59E0B', glow: 'rgba(245,158,11,0.2)',   bg: 'rgba(245,158,11,0.08)'  },
  }
  const s = styles[accent] || styles.default

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: '#0D1526',
        border: `1px solid ${s.glow}`,
        boxShadow: `0 0 20px ${s.glow}`,
      }}
    >
      <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#64748B' }}>{title}</p>
      <p className="text-3xl font-black mb-1" style={{ color: s.color, textShadow: `0 0 20px ${s.glow}` }}>
        {value}
      </p>
      {subtitle && <p className="text-xs mt-1" style={{ color: '#475569' }}>{subtitle}</p>}
    </div>
  )
}
