import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',         label: 'Dashboard' },
  { to: '/compare',  label: 'IIT Compare' },
  { to: '/branches', label: 'Branches' },
  { to: '/sectors',  label: 'Sectors' },
  { to: '/trends',   label: 'Trends' },
  { to: '/predict',  label: 'Predict' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen border-r border-gray-700 flex flex-col shrink-0" style={{ backgroundColor: '#1F2937' }}>
      <div className="px-6 py-6 border-b border-gray-700">
        <p className="font-bold text-lg leading-tight" style={{ color: '#F59E0B' }}>IIT Placement</p>
        <p className="text-gray-400 text-xs mt-0.5">Intelligence Portal</p>
      </div>
      <nav className="flex flex-col gap-1 p-3 mt-2">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: '#F59E0B' } : {}}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
