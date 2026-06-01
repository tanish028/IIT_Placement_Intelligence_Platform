import { useEffect, useState } from 'react'
import { getFilters, getComparison } from '../api/api'
import Spinner from '../components/Spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

const card = { backgroundColor: '#1F2937' }
const inner = { backgroundColor: '#111827' }
const selectCls = "rounded-lg px-3 py-2 text-sm border border-gray-600 text-white"

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

  const tooltip = { contentStyle: { backgroundColor: '#1F2937', border: 'none', color: '#fff' } }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">IIT Comparison</h1>
      <p className="text-gray-400 mb-6">Compare placement stats across multiple IITs</p>

      <div className="rounded-xl p-5 border border-gray-700 mb-6" style={card}>
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.institutes.map(inst => (
            <button key={inst} onClick={() => toggleInstitute(inst)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={selected.includes(inst)
                ? { backgroundColor: '#F59E0B', color: '#111827' }
                : { backgroundColor: '#374151', color: '#d1d5db' }}>
              {inst}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <select value={year} onChange={e => setYear(e.target.value)}
            className={selectCls} style={inner}>
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handleCompare}
            className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#F59E0B', color: '#111827' }}>
            Compare
          </button>
        </div>
      </div>

      {loading && <Spinner />}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="rounded-xl p-5 border border-gray-700" style={card}>
            <h2 className="text-white font-semibold mb-4">Average Package (LPA)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="institute" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip {...tooltip} />
                <Bar dataKey="avg_package_lpa" fill="#F59E0B" name="Avg Package (LPA)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-5 border border-gray-700" style={card}>
            <h2 className="text-white font-semibold mb-4">Placement Percentage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="institute" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip {...tooltip} />
                <Bar dataKey="placement_percentage" fill="#60A5FA" name="Placement %" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-700 overflow-hidden" style={card}>
            <table className="w-full text-sm">
              <thead style={inner}>
                <tr className="text-gray-400">
                  <th className="text-left px-4 py-3">Institute</th>
                  <th className="px-4 py-3">Avg Package</th>
                  <th className="px-4 py-3">Median Package</th>
                  <th className="px-4 py-3">Highest Domestic</th>
                  <th className="px-4 py-3">Placement %</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-t border-gray-700 text-gray-300">
                    <td className="px-4 py-3 font-medium text-white">{r.institute}</td>
                    <td className="px-4 py-3 text-center font-semibold" style={{ color: '#F59E0B' }}>{r.avg_package_lpa ?? '—'} LPA</td>
                    <td className="px-4 py-3 text-center">{r.median_package_lpa ?? '—'} LPA</td>
                    <td className="px-4 py-3 text-center">{r.highest_domestic_lpa ?? '—'} LPA</td>
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
