import { useEffect, useState } from 'react'
import { getFilters, getSectorStats } from '../api/api'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#F59E0B', '#60A5FA', '#34D399', '#F87171', '#A78BFA', '#FB923C']

const ttStyle = {
  contentStyle: { backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: 10 },
  labelStyle: { color: 'var(--text-2)' },
}

export default function Sectors() {
  const [filters, setFilters] = useState(null)
  const [institute, setInstitute] = useState('')
  const [year, setYear] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getFilters().then(res => {
      setFilters(res.data)
      setInstitute(res.data.institutes[0])
      setYear(String(res.data.years[res.data.years.length - 1]))
    })
  }, [])

  const handleLoad = () => {
    setLoading(true)
    getSectorStats(institute, year).then(res => setData(res.data)).finally(() => setLoading(false))
  }

  if (!filters) return <Spinner />

  const pieData = data.map(d => ({ name: d.sector, value: d.students_placed }))

  return (
    <div>
      <PageHeader
        badge="Sector Breakdown"
        title="Sector Analytics"
        subtitle="Hiring distribution by industry sector"
        accent="#A78BFA"
      />

      <div className="theme-card p-5 mb-6">
        <div className="flex flex-wrap gap-3">
          <select value={institute} onChange={e => setInstitute(e.target.value)} className="theme-select">
            {filters.institutes.map(i => <option key={i}>{i}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="theme-select">
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button
            onClick={handleLoad}
            className="px-6 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#05091A', boxShadow: '0 4px 15px rgba(245,158,11,0.25)' }}
          >
            Load
          </button>
        </div>
      </div>

      {loading && <Spinner />}

      {data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="theme-card p-5">
            <p className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Students Placed by Sector</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="theme-card overflow-hidden self-start">
            <table className="w-full text-sm theme-table">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Placement %</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      {r.sector}
                    </td>
                    <td className="px-4 py-3 text-center">{r.students_placed}</td>
                    <td className="px-4 py-3 text-center font-semibold" style={{ color: '#60A5FA' }}>{r.placement_percentage ?? '—'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
