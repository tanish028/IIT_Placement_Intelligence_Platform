import { useEffect, useState } from 'react'
import { getFilters, getTrends, getGrowthRates } from '../api/api'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts'

const tooltip = {
  contentStyle: { backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: 10 },
  labelStyle: { color: 'var(--text-2)' },
}

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
      <PageHeader
        badge="📈 Historical Trends"
        title="Trend Analysis"
        subtitle="Salary growth and placement trends over the years"
        accent="#34D399"
      />

      {/* Section 1: Line chart */}
      <div className="theme-card p-5 mb-6">
        <p className="font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Package & Placement Trend</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={institute} onChange={e => setInstitute(e.target.value)} className="theme-select">
            {filters.institutes.map(i => <option key={i}>{i}</option>)}
          </select>
          <button
            onClick={handleTrends}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#05091A', boxShadow: '0 4px 15px rgba(245,158,11,0.25)' }}
          >
            Load Trend
          </button>
        </div>
        {loading && <Spinner />}
        {trendData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--chart-text)' }} />
              <YAxis yAxisId="left"  tick={{ fill: 'var(--chart-text)' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--chart-text)' }} />
              <Tooltip {...tooltip} />
              <Legend />
              <Line yAxisId="left"  type="monotone" dataKey="avg_package_lpa"      stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} name="Avg Package (LPA)" />
              <Line yAxisId="right" type="monotone" dataKey="placement_percentage" stroke="#60A5FA" strokeWidth={2.5} dot={{ r: 4 }} name="Placement %" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Section 2: Growth bar chart */}
      <div className="theme-card p-5">
        <p className="font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Package Growth Rate Across IITs</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>From</label>
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} className="theme-select">
              {filters.years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>To</label>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} className="theme-select">
              {filters.years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <button
            onClick={handleGrowth}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#34D399,#10B981)', color: '#05091A', boxShadow: '0 4px 15px rgba(52,211,153,0.25)' }}
          >
            Compare Growth
          </button>
        </div>
        {growthData.length === 0 && !loading && (
          <p className="text-sm mt-2" style={{ color: 'var(--text-2)' }}>
            No data for this range. Try years where both have data (e.g. 2021–2024).
          </p>
        )}
        {growthData.length > 0 && (
          <ResponsiveContainer width="100%" hei