import { useEffect, useState } from 'react'
import { getFilters, getBranchStats, getBestIITs } from '../api/api'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const tooltip = {
  contentStyle: { backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: 10 },
  labelStyle: { color: 'var(--text-2)' },
}

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
      <PageHeader
        badge="🌿 Branch Intelligence"
        title="Branch Analytics"
        subtitle="Explore placement stats by branch across IITs"
        accent="#34D399"
      />

      {/* Section 1: Branch-wise stats */}
      <div className="theme-card p-5 mb-6">
        <p className="font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Branch-wise Stats for an IIT</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={institute} onChange={e => setInstitute(e.target.value)} className="theme-select">
            {filters.institutes.map(i => <option key={i}>{i}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="theme-select">
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button
            onClick={handleBranchStats}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#05091A', boxShadow: '0 4px 15px rgba(245,158,11,0.25)' }}
          >
            Load
          </button>
        </div>
        {loading && <Spinner />}
        {branchData.length > 0 && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={branchData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis type="number" tick={{ fill: 'var(--chart-text)' }} />
              <YAxis dataKey="branch" type="category" tick={{ fill: 'var(--chart-text)', fontSize: 11 }} width={100} />
              <Tooltip {...tooltip} />
              <Bar dataKey="avg_package_lpa" fill="#F59E0B" name="Avg Package (LPA)" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Section 2: Best IITs for a branch */}
      <div className="theme-card p-5">
        <p className="font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Which IIT is Best for a Branch?</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={branch} onChange={e => setBranch(e.target.value)} className="theme-select">
            {filters.branches.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="theme-select">
            {filters.years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button
            onClick={handleBestIITs}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#60A5FA,#3B82F6)', color: '#05091A', boxShadow: '0 4px 15px rgba(96,165,250,0.25)' }}
          >
            Rank IITs
          </button>
        </div>
        {bestIITs.length > 0 && (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm theme-table">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">Institute</th>
                  <th className="px-4 py-3">Avg Package (LPA)</th>
                  <th className="px-4 py-3">Placement %</th>
                </tr>
              </thead>
              <tbody>
                {bestIITs.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                        style={{
                   