import { useEffect, useState } from 'react'
import { getFilters, getBranchStats, getBestIITs } from '../api/api'
import Spinner from '../components/Spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const card = { backgroundColor: '#1F2937' }
const inner = { backgroundColor: '#111827' }
const selectCls = "rounded-lg px-3 py-2 text-sm border border-gray-600 text-white"
const tooltip = { contentStyle: { backgroundColor: '#1F2937', border: 'none', color: '#fff' } }

export default function Branches() {
  const [filters, setFilters] = useState(null)
  const [institute, setInstitute] = useState('')
  const [year, setYear] = useState('')
  const [branchData, setBranchData] = useState([])
  const [bestIITs, setBestIITs] = useState([])
  const [branch, setBranch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getFilters().then(res => {
      setFilters(res.data)
      setInstitute(res.data.institutes[0])
      setYear(String(res.data.years[res.data.years.length - 1]))
      setBranch(res.data.branches[0])
    })
  }, [])

  const handleBranchStats = () => {
    setLoading(true)
    getBranchStats(institute, year).then(res => setBranchData(res.data)).finally(() => setLoading(false))
  }

  const handleBestIITs = () => {
    setLoading(true)
    getBestIITs(branch, year).then(res => setBestIITs(res.data)).finally(() => setLoading(false))
  }

  if (!filters) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Branch Analytics</h1>
      <p className="text-gray-400 mb-6">Explore placement stats by branch</p>

      <div className="rounded-xl p-5 border border-gray-700 mb-6" style={card}>
        <h2 className="text-white font-semibold mb-3">Branch-wise Stats for an IIT</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={institute} onChange={e => setInstitute(e.target.value)} className={selectCls} style={inner}>
            {filters.institutes.map(i => <option key={i}>{i}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className={selectCls} style={inner}>
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handleBranchStats} className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#F59E0B', color: '#111827' }}>Load</button>
        </div>
        {loading && <Spinner />}
        {branchData.length > 0 && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={branchData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fill: '#9ca3af' }} />
              <YAxis dataKey="branch" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={90} />
              <Tooltip {...tooltip} />
              <Bar dataKey="avg_package_lpa" fill="#F59E0B" name="Avg Package (LPA)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl p-5 border border-gray-700" style={card}>
        <h2 className="text-white font-semibold mb-3">Which IIT is Best for a Branch?</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={branch} onChange={e => setBranch(e.target.value)} className={selectCls} style={inner}>
            {filters.branches.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className={selectCls} style={inner}>
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handleBestIITs} className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#60A5FA', color: '#111827' }}>Rank IITs</button>
        </div>
        {bestIITs.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-700">
            <table className="w-full text-sm">
              <thead style={inner}>
                <tr className="text-gray-400">
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">Institute</th>
                  <th className="px-4 py-3">Avg Package (LPA)</th>
                  <th className="px-4 py-3">Placement %</th>
                </tr>
              </thead>
              <tbody>
                {bestIITs.map((r, i) => (
                  <tr key={i} className="border-t border-gray-700 text-gray-300">
                    <td className="px-4 py-3 text-gray-500">#{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{r.institute}</td>
                    <td className="px-4 py-3 text-center font-semibold" style={{ color: '#F59E0B' }}>{r.avg_package_lpa}</td>
                    <td className="px-4 py-3 text-center" style={{ color: '#60A5FA' }}>{r.placement_percentage ?? '—'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
