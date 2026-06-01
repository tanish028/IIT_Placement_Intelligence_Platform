import { useEffect, useState } from 'react'
import { getFilters, getTrends, getGrowthRates } from '../api/api'
import Spinner from '../components/Spinner'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts'

const card = { backgroundColor: '#1F2937' }
const inner = { backgroundColor: '#111827' }
const selectCls = "rounded-lg px-3 py-2 text-sm border border-gray-600 text-white"
const tooltip = { contentStyle: { backgroundColor: '#1F2937', border: 'none', color: '#fff' } }

export default function Trends() {
  const [filters, setFilters] = useState(null)
  const [institute, setInstitute] = useState('')
  const [trendData, setTrendData] = useState([])
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [growthData, setGrowthData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getFilters().then(res => {
      setFilters(res.data)
      setInstitute(res.data.institutes[0])
      setYearFrom(String(res.data.years[0]))
      setYearTo(String(res.data.years[res.data.years.length - 1]))
    })
  }, [])

  const handleTrends = () => {
    setLoading(true)
    getTrends(institute).then(res => setTrendData(res.data)).finally(() => setLoading(false))
  }

  const handleGrowth = () => {
    setLoading(true)
    getGrowthRates(yearFrom, yearTo).then(res => setGrowthData(res.data)).finally(() => setLoading(false))
  }

  if (!filters) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Trend Analysis</h1>
      <p className="text-gray-400 mb-6">Historical trends and growth rates</p>

      <div className="rounded-xl p-5 border border-gray-700 mb-6" style={card}>
        <h2 className="text-white font-semibold mb-3">Package & Placement Trend</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={institute} onChange={e => setInstitute(e.target.value)} className={selectCls} style={inner}>
            {filters.institutes.map(i => <option key={i}>{i}</option>)}
          </select>
          <button onClick={handleTrends} className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#F59E0B', color: '#111827' }}>Load Trend</button>
        </div>
        {loading && <Spinner />}
        {trendData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af' }} />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
              <Tooltip {...tooltip} />
              <Legend />
              <Line yAxisId="left"  type="monotone" dataKey="avg_package_lpa"      stroke="#F59E0B" strokeWidth={2} dot name="Avg Package (LPA)" />
              <Line yAxisId="right" type="monotone" dataKey="placement_percentage" stroke="#60A5FA" strokeWidth={2} dot name="Placement %" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl p-5 border border-gray-700" style={card}>
        <h2 className="text-white font-semibold mb-3">Package Growth Rate Across IITs</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">From</label>
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} className={selectCls} style={inner}>
              {filters.years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">To</label>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} className={selectCls} style={inner}>
              {filters.years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handleGrowth} className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#60A5FA', color: '#111827' }}>Compare Growth</button>
        </div>
        {growthData.length === 0 && !loading && (
          <p className="text-gray-500 text-sm mt-2">No data available for this year range. Try a range where both years have data (e.g. 2021 – 2024).</p>
        )}
        {growthData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="institute" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af' }} unit="%" />
              <Tooltip {...tooltip} formatter={v => `${v}%`} />
              <Bar dataKey="growth_pct" fill="#34D399" name="Growth %" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
