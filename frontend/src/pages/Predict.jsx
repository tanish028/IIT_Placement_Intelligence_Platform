import { useEffect, useState } from 'react'
import { getFilters, predict } from '../api/api'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

const ttStyle = {
  contentStyle: {
    backgroundColor: 'var(--tooltip-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
    borderRadius: 10,
  },
}

// Mini stat chip used in the model accuracy panel
function MetricChip({ label, value, sub, color }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-1"
      style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
        {label}
      </p>
      <p className="text-xl font-black" style={{ color: color || '#F59E0B' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--text-2)' }}>{sub}</p>}
    </div>
  )
}

// Horizontal SHAP bar chart
function ShapChart({ data, title, color }) {
  const chartData = Object.entries(data).map(([feature, value]) => ({
    feature,
    value: parseFloat(value),
    abs: Math.abs(parseFloat(value)),
  })).sort((a, b) => b.abs - a.abs)

  const maxAbs = Math.max(...chartData.map(d => d.abs), 0.1)

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>
        {title}
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <XAxis
            type="number"
            domain={[-maxAbs * 1.1, maxAbs * 1.1]}
            tick={{ fill: 'var(--chart-text)', fontSize: 10 }}
            tickFormatter={v => v > 0 ? '+' + v.toFixed(1) : v.toFixed(1)}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fill: 'var(--chart-text)', fontSize: 11 }}
            width={70}
          />
          <Tooltip
            {...ttStyle}
            formatter={(v) => [(v > 0 ? '+' : '') + v.toFixed(2), 'Contribution']}
          />
          <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1.5} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.value >= 0 ? '#34D399' : '#F87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>
        Green = pushes prediction up &nbsp;|&nbsp; Red = pushes prediction down
      </p>
    </div>
  )
}

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

  const fields = [
    { label: 'Institute', key: 'institute', opts: filters.institutes },
    { label: 'Branch',    key: 'branch',    opts: filters.branches },
    { label: 'Program',   key: 'program',   opts: filters.programs },
  ]

  const mi = result && result.model_info && Object.keys(result.model_info).length > 0
    ? result.model_info
    : null

  return (
    <div>
      <PageHeader
        badge="ML Powered"
        title="Prediction Center"
        subtitle="RandomForest with 5-fold CV, SHAP explanations, and tree-based confidence intervals"
        accent="#A78BFA"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Input form ─────────────────────────────────────────── */}
        <div className="theme-card p-6">
          <p className="font-semibold mb-5" style={{ color: 'var(--text-1)' }}>Enter Details</p>
          <div className="space-y-4">
            {fields.map(({ label, key, opts }) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--text-2)' }}>
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
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-2)' }}>
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
              Predict
            </button>
          </div>

          {/* Model accuracy panel — shown after first prediction if metrics available */}
          {mi && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>
                Model Accuracy (Package Model)
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <MetricChip
                  label="5-Fold CV R2"
                  value={mi.pkg_cv_r2}
                  sub={"± " + mi.pkg_cv_r2_std + " std"}
                  color="#A78BFA"
                />
                <MetricChip
                  label="CV MAE"
                  value={mi.pkg_cv_mae + " LPA"}
                  sub="cross-validated"
                  color="#F59E0B"
                />
                <MetricChip
                  label="RF vs Linear"
                  value={mi.pkg_improvement_pct + "%"}
                  sub="MAE improvement"
                  color="#34D399"
                />
                <MetricChip
                  label="Test MAE"
                  value={mi.pkg_test_mae + " LPA"}
                  sub={"baseline: " + mi.pkg_baseline_mae}
                  color="#60A5FA"
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                RandomForest beats LinearRegression by {mi.pkg_improvement_pct}% on unseen data, justifying model complexity.
              </p>
            </div>
          )}
        </div>

        {/* ── Results column ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="theme-card p-6">
            <p className="font-semibold mb-5" style={{ color: 'var(--text-1)' }}>Prediction Result</p>

            {loading && <div className="py-8"><Spinner /></div>}

            {error && (
              <div className="rounded-xl p-4"
                style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
                <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Package prediction */}
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
                    95% CI: <span style={{ color: 'var(--text-1)' }}>{result.package_range_lpa.min} - {result.package_range_lpa.max} LPA</span>
                    <span className="ml-2" style={{ color: 'var(--text-2)' }}>(std: {result.package_range_lpa.std})</span>
                  </p>
                </div>

                {/* Placement prediction */}
                <div className="rounded-xl p-4 relative overflow-hidden"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top right, rgba(96,165,250,0.08) 0%, transparent 70%)' }} />
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>
                    Predicted Placement %
                  </p>
                  <p className="text-4xl font-black" style={{ color: '#60A5FA' }}>
                    {result.predicted_placement_pct}
                    <span className="text-xl font-medium ml-1" style={{ color: 'var(--text-2)' }}>%</span>
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>
                    95% CI: <span style={{ color: 'var(--text-1)' }}>{result.placement_range_pct.min} - {result.placement_range_pct.max}%</span>
                    <span className="ml-2" style={{ color: 'var(--text-2)' }}>(std: {result.placement_range_pct.std})</span>
                  </p>
                </div>

                {/* Factors used */}
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>
                    Factors Used
                  </p>
                  <div className="space-y-2">
                    {Object.entries(result.factors_used).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'rgba(52,211,153,0.2)', color: '#34D399' }}>
                          v
                        </span>
                        <span style={{ color: 'var(--text-2)' }}>{key}</span>
                        <span className="font-semibold" style={{ color: 'var(--text-1)' }}>= {val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                  Fill in the form and click Predict to see ML-powered results.
                </p>
              </div>
            )}
          </div>

          {/* SHAP explanations — only shown after prediction */}
          {result && result.shap_package && (
            <div className="theme-card p-5">
              <p className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
                Why this prediction? (SHAP)
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-2)' }}>
                SHAP shows how much each input feature pushed the prediction above or below the average.
              </p>
              <ShapChart
                data={result.shap_package}
                title="Package Model - Feature Contributions (LPA)"
                color="#F59E0B"
              />
              <div className="mt-3">
                <ShapChart
                  data={result.shap_placement}
                  title="Placement Model - Feature Contributions (%)"
                  color="#60A5FA"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
