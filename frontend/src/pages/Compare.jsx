import { useEffect, useState } from 'react'
import { getFilters, getComparison } from '../api/api'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const tooltip = {
  contentStyle: { backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: 10 },
  labelStyle: { color: 'var(--text-2)' },
}

export default function Compare() {
  const [filters, setFilters] = useState(null)
  const [selected, setSelected] = useState([])
  const [year, setYear] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getFilters().then(res => {
      setFilters(res.data)
      setYear(String(res.data.years[res.data.years.length - 1]))
    })
  }, [])

  const toggleInstitute = (inst) =>
    setSelected(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst])

  const handleCompare = () => {
    if (selected.length < 2) return alert('Select at least 2 IITs.')
    setLoading(true)
    getComparison(selected, year).then(res => setResults(res.data)).finally(() => setLoading(false))
  }

  if (!filters) return <Spinner />

  return (
    <div>
      <PageHeader
        badge="⚖️ Side-by-Side"
        title="IIT Comparison"
        subtitle="Compare placement stats across multiple IITs for any year"
      />

      {/* Filter card */}
      <div className="theme-card p-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>
          Select IITs to compare
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.institutes.map(inst => (
            <button
              key={inst}
              onClick={() => toggleInstitute(inst)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={selected.includes(inst)
                ? { background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#05091A', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }
                : { backgroundColor: 'var(--input-bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }
              }
            >
              {inst}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="theme-select"
          >
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button
            onClick={handleCompare}
            className="px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#05091A', boxShadow: '0 4px 15px rgba(245,158,11,0.25)' }}
          >
            Compare
          </button>
        </div>
      </div>

      {loading && <Spinner />}

      {results.length > 0 && (
        <div className="space-y-6">
          {/* Avg Package Chart */}
          <div className="theme-card p-5">
            <p className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Average Package (LPA)</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="institute" tick={{ fill: 'var(--chart-text)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--chart-text)' }} />
                <Tooltip {...tooltip} />
                <Bar dataKey="avg_package_lpa" fill="#F59E0B" name="Avg Package (LPA)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Placement % Chart */}
          <div className="theme-card p-5">
            <p className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Placement Percentage</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="institute" tick={{ fill: 'var(--chart-text)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--chart-text)' }} />
                <Tooltip {...tooltip} />
                <Bar dataKey="placement_percentage" fill="#60A5FA" name="Placement %" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="theme-card overflow-hidden">
            <table className="w-full text-sm theme-table">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Institute</th>
                  <th className="px-4 py-3">Avg Package</th>
                  <th className="px-4 py-3">Median Package</th>
                  <th className="px-4 py-3">Highest Domestic</th>
                  <th className="px-4 py-3">Placement %</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-1)' }}>{r.institute}</td>
                    <td className="px-4 py-3 text-center font-bold" style={{ color: '#F59E0B' }}>