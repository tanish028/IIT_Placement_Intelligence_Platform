import { useEffect, useState } from 'react'
import { getFilters, predict } from '../api/api'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'

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
      .catch(() => setError('Prediction failed. Make sure inputs match trained data.'))
      .finally(() => setLoading(false))
  }

  if (!filters) return <Spinner />

  return (
    <div>
      <PageHeader
        badge="🤖 ML Powered"
        title="Prediction Center"
        subtitle="RandomForest model trained on IIT placement data (2021–2025)"
        accent="#A78BFA"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="theme-card p-6">
          <p className="font-semibold mb-5" style={{ color: 'var(--text-1)' }}>Enter Details</p>
          <div className="space-y-4">
            {[
              { label: 'Institute', key: 'institute', opts: filters.institutes },
              { label: 'Branch',    key: 'branch',    opts: filters.branches },
              { label: 'Program',   key: 'program',   opts: filters.programs },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>
                  {label}
                </label>
                <select
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="theme-select w-full"
                >
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                className="theme-select w-full"
                min="2021"
                max="2030"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 mt-2"
              style={{ background: 'linear-gradient(135deg,#A78BFA,#8B5CF6)', color: '#fff', boxShadow: '0 4px 20px rgba(139,92,246,0.35)' }}
            >
              ✨ Predict
            </button>
          </div>
        </div>

        {/* Result Card */}
        <div className="theme-card p-6">
          <p className="font-semibold mb-5" style={{ color: 'var(--text-1)' }}>Prediction Result</p>

          {loading && <div className="py-8"><Spinner /></div>}
          {error && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Avg Package */}
              <div className="rounded-xl p-4 relative overflow-hidden"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>
                  Predicted Avg Package
                </p>
                <p className="text-4xl font-black stat-glow-amber" style={{ color: '#F59E0B' }}>
                  {result.predicted_avg_package_lpa}
                  <span className="text-xl font-medium ml-1" style={{ color: 'var(--text-2)' }}>LPA</span>
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>
                  Expected Range:{' '}
                  <span style={{ color: 'var(--text-1)' }}>{result.package_range_lpa.min} – {result.package_range_lpa.max} LPA</span>
                </p>
              </div>

              {/* Placement % */}
              <div className="rounded-xl p-4 relative overflow-hidden"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top right, rgba(96,165,250,0.08) 0%, transparent 70%)' }} />
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>
                  Predicted Placement %
                </p>
                <p className="text-4xl font-black stat-glow-violet" style={{ color: '#60A5FA' }}>
                  {result.predicted_placement_pct}
                  <span className="text-xl font-medium ml-1" style={{ color: 'var(--text-2)' }}>%</span>
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>
       