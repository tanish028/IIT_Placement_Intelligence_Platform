import { useEffect, useState } from 'react'
import { getSummary } from '../api/api'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSummary()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load summary.'))
  }, [])

  if (error) return <p className="text-red-400">{error}</p>
  if (!data) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-400 mb-8">IIT placement data at a glance</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="IITs Covered"    value={data.total_institutes} accent="amber" />
        <StatCard title="Years Covered"   value={data.years_covered}    accent="amber" />
        <StatCard title="Avg Package"     value={`${data.avg_package_lpa} LPA`}   accent="green" />
        <StatCard title="Avg Placement %" value={`${data.avg_placement_pct}%`}    accent="blue" />
      </div>

      <div className="rounded-xl p-6 border border-gray-700" style={{ backgroundColor: '#1F2937' }}>
        <h2 className="text-white font-semibold text-lg mb-4">About this Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#111827' }}>
            <p className="font-semibold mb-1" style={{ color: '#F59E0B' }}>Compare IITs</p>
            <p>Side-by-side comparison of packages, placement %, and sector distribution across institutes.</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#111827' }}>
            <p className="font-semibold mb-1" style={{ color: '#34D399' }}>Branch Analytics</p>
            <p>Discover the highest paying branches, placement trends, and sector preferences per branch.</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#111827' }}>
            <p className="font-semibold mb-1" style={{ color: '#60A5FA' }}>ML Predictions</p>
            <p>Predict expected packages and placement % for any IIT, branch, program, and year combination.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
