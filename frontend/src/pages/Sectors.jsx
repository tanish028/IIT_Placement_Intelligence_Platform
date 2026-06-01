import { useEffect, useState } from 'react'
import { getFilters, getSectorStats } from '../api/api'
import Spinner from '../components/Spinner'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#F59E0B', '#60A5FA', '#34D399', '#F87171', '#A78BFA', '#FB923C']
const card = { backgroundColor: '#1F2937' }
const inner = { backgroundColor: '#111827' }
const selectCls = "rounded-lg px-3 py-2 text-sm border border-gray-600 text-white"
const tooltip = { contentStyle: { backgroundColor: '#1F2937', border: 'none', color: '#fff' } }

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
      <h1 className="text-2xl font-bold text-white mb-1">Sector Analytics</h1>
      <p className="text-gray-400 mb-6">Hiring distribution by sector</p>

      <div className="rounded-xl p-5 border border-gray-700 mb-6" style={card}>
        <div className="flex flex-wrap gap-3 mb-2">
          <select value={institute} onChange={e => setInstitute(e.target.value)} className={selectCls} style={inner}>
            {filters.institutes.map(i => <option key={i}>{i}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className={selectCls} style={inner}>
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handleLoad} className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#F59E0B', color: '#111827' }}>Load</button>
        </div>
      </div>

      {loading && <Spinner />}

      {data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-5 border border-gray-700" style={card}>
            <h2 className="text-white font-semibold mb-4">Students Placed by Sector</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-700 overflow-hidden self-start" style={card}>
            <table className="w-full text-sm">
              <thead style={inner}>
                <tr className="text-gray-400">
                  <th className="text-left px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Students Placed</th>
                  <th className="px-4 py-3">Placement %</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i} className="border-t border-gray-700 text-gray-300">
                    <td className="px-4 py-3 font-medium" style={{ color: COLORS[i % COLORS.length] }}>{r.sector}</td>
                    <td className="px-4 py-3 text-center">{r.students_placed}</td>
                    <td className="px-4 py-3 text-center" style={{ color: '#60A5FA' }}>{r.placement_percentage ?? '—'}%</td>
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
