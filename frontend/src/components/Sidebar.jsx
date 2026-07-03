import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { LayoutDashboard, Scale, GitBranch, PieChart, TrendingUp, Sparkles } from './icons'

const links = [
  { to: '/',         label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/compare',  label: 'IIT Compare', icon: Scale },
  { to: '/branches', label: 'Branches',    icon: GitBranch },
  { to: '/sectors',  label: 'Sectors',     icon: PieChart },
  { to: '/trends',   label: 'Trends',      icon: TrendingUp },
  { to: '/predict',  label: 'Predict',     icon: Sparkles },
]

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

export default function Sidebar({ collapsed, onToggle }) {
  const { dark, toggle: toggleTheme } = useTheme()

  const sidebarStyle = {
    width: collapsed ? '68px' : '224px',
    backgroundColor: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--border)',
  }

  const activeStyle = {
    background: 'linear-gradient(135deg,#F59E0B,#D97706)',
    boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
    color: '#05091A',
  }

  return (
    <aside className="min-h-screen flex flex-col shrink-0 relative transition-all duration-300" style={sidebarStyle}>

      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />

      <div className="flex items-center justify-between px-3 py-5 relative"
        style={{ borderBottom: '1px solid var(--border)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#05091A' }}>
              IP
            </div>
            <div>
              <p className="font-bold text-xs leading-tight" style={{ color: '#F59E0B' }}>IIT Placement</p>
              <p style={{ color: 'var(--text-2)', fontSize: '10px' }}>Intelligence Portal</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black mx-auto"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#05091A' }}>
            IP
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-2)' }}>
            <ChevronLeft />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={onToggle} className="mx-auto mt-2 p-1.5 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-2)' }}>
          <ChevronRight />
        </button>
      )}

      <nav className="flex flex-col gap-1 p-2 mt-1 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ' +
              (collapsed ? 'justify-center px-2 py-3 ' : 'px-3 py-2.5 ') +
              (isActive ? '' : 'hover:bg-white/5')
            }
            style={({ isActive }) => isActive
              ? activeStyle
              : { color: 'var(--text-2)' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? '#05091A' : 'var(--text-2)'} />
                {!collapsed && label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={toggleTheme}
          className={'flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/5 mb-2 ' + (collapsed ? 'justify-center' : '')}
          style={{ color: 'var(--text-2)' }}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
          {!collapsed && (dark ? 'Light Mode' : 'Dark Mode')}
        </button>
        {!collapsed && (
          <>
            <p style={{ color: 'var(--text-2)', fontSize: '10px', padding: '0 4px' }}>v1.0 · Data: 2021–2025</p>
            <p style={{ color: 'var(--text-2)', fontSize: '10px', padding: '2px 4px 0' }}>13 IITs · 350+ data points</p>
          </>
        )}
      </div>
    </aside>
  )
}
