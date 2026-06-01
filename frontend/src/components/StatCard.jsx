export default function StatCard({ title, value, subtitle, accent }) {
  const colors = {
    amber:  '#F59E0B',
    blue:   '#60A5FA',
    green:  '#34D399',
    default: '#F59E0B',
  }
  const color = colors[accent] || colors.default

  return (
    <div className="rounded-xl p-5 border border-gray-700" style={{ backgroundColor: '#1F2937' }}>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
