import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Scale, GitBranch, PieChart, TrendingUp, Sparkles } from './icons'

const links = [
  { to: '/',         label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/compare',  label: 'IIT Compare',     icon: Scale },
  { to: '/branches', label: 'Branches',         icon: GitBranch },
  { to: '/sectors',  label: 'Sectors',          icon: PieChart },
  { to: '/trends',   label: 'Trends',           icon: TrendingUp },
  { to: '/predict',  label: 'Predict',          icon: Sparkles },
]

export default function Sidebar() {
  return (
    <aside
      className="w-56 min-h-screen flex flex-col shrink-0 relative"
      style={{
        backgroundColor: '#080D20',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top ambient glow */}
      <div
        className="absolute top-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(245,158,11,0.08) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="px-5 py-6 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#05091A' }}
          >
            IP
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: '#F59E0B' }}>IIT Placement</p>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>Intelligence Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 mt-1 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom tag */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs" style={{ color: 'rgba(100,116,139,0.8)' }}>v1.0 · Data: 2021–2025</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(100,116,139,0.6)' }}>13 IITs · 350+ data points</p>
      </div>
    </aside>
  )
}
