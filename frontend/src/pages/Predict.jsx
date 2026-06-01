import { useEffect, useState } from 'react'
import { getFilters, predict } from '../api/api'
import Spinner from '../components/Spinner'

const card = { backgroundColor: '#1F2937' }
const inner = { backgroundColor: '#111827' }
const selectCls = "w-full rounded-lg px-3 py-2 text-sm border border-gray-600 text-white"

export default function Predict() {
  const [filters, setFilters] = useState(null)
  const [form, setForm] = useState({ institute: '', branch: '', program: '', year: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getFilters().then(res => {
      const d = res.data
      setFilters(d)
      setForm({
        institute: d.institutes[0],
        branch: d.branches[0],
        program: d.programs[0],
        year: String(d.years[d.years.length - 1] + 1),
      })
    })
  }, [])

  const handleSubmit = () => {
    setError(null)
    setResult(null)
    setLoading(true)
    predict({ ...form, year: parseInt(form.year) })
      .then(res => setResult(res.data))
      .catch(() => setError('Prediction failed. Make sure the inputs match trained data.'))
      .finally(() => setLoading(false))
  }

  if (!filters) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Prediction Center</h1>
      <p className="text-gray-400 mb-6">ML-powered placement predictions using RandomForest</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="rounded-xl p-6 border border-gray-700" style={card}>
          <h2 className="text-white font-semibold mb-4">Enter Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Institute</label>
              <select value={form.institute} onChange={e => setForm({ ...form, institute: e.target.value })}
                className={selectCls} style={inner}>
                {filters.institutes.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Branch</label>
              <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}
                className={selectCls} style={inner}>
                {filters.branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Program</label>
              <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}
                className={selectCls} style={inner}>
                {filters.programs.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Year</label>
              <input type="number" value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                className={selectCls} style={inner}
                min="2021" max="2030" />
            </div>
            <button onClick={handleSubmit}
              className="w-full py-2.5 rounded-lg text-sm font-semibold mt-2"
              style={{ backgroundColor: '#F59E0B', color: '#111827' }}>
              Predict
            </button>
          </div>
        </div>

        {/* Result Card */}
        <div className="rounded-xl p-6 border border-gray-700" style={card}>
          <h2 className="text-white font-semibold mb-4">Prediction Result</h2>

          {loading && <Spinner />}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {result && (
            <div className="space-y-4">
              {/* Package */}
              <div className="rounded-lg p-4" style={inner}>
                <p className="text-gray-400 text-xs mb-1">Predicted Avg Package</p>
                <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>
                  {result.predicted_avg_package_lpa} <span className="text-lg">LPA</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Expected Range:{' '}
                  <span className="text-gray-300">{result.package_range_lpa.min} – {result.package_range_lpa.max} LPA</span>
                </p>
              </div>

              {/* Placement % */}
              <div className="rounded-lg p-4" style={inner}>
                <p className="text-gray-400 text-xs mb-1">Predicted Placement %</p>
                <p className="text-3xl font-bold" style={{ color: '#60A5FA' }}>
                  {result.predicted_placement_pct}<span className="text-lg">%</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Expected Range:{' '}
                  <span className="text-gray-300">{result.placement_range_pct.min} – {result.placement_range_pct.max}%</span>
                </p>
              </div>

              {/* Factors Used */}
              <div className="rounded-lg p-4" style={inner}>
                <p className="text-gray-400 text-xs mb-3 font-medium uppercase tracking-wide">Factors Used</p>
                <div className="space-y-2">
                  {Object.entries(result.factors_used).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span style={{ color: '#34D399' }}>✓</span>
                      <span className="text-gray-400">{key}</span>
                      <span className="text-white font-medium">= {val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <p className="text-gray-500 text-sm">Fill in the form and click Predict to see results.</p>
          )}
        </div>
      </div>
    </div>
  )
}
