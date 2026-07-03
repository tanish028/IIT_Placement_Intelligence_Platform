import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { LayoutDashboard, Scale, GitBranch, PieChart, TrendingUp, Sparkles } from './icons'

const links = [
  { to: '/',         label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/compare',  label: 'IIT Compare',  icon: Scale },
  { to: '/branches', label: 'Branches',     icon: GitBranch },
  { to: '/sectors',  label: 'Sectors',      icon: PieChart },
  { to: '/trends',   label: 'Trends',       icon: TrendingUp },
  { to: '/predict',  label: 'Predict',      icon: Sparkles },
]

// Sun icon
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

// Moon icon
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

// Chevron icon
const ChevronIcon = ({ right }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {right ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
  </svg>
)

export default function Sidebar({ collapsed, onToggle }) {
  const { dark, toggle: toggleTheme } = useTheme()

  return (
    <aside
      className="min-h-screen flex flex-col shrink-0 relative transition-all duration-300"
      style={{
        width: collapsed ? '68px' : '224px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />

      {/* Logo + Collapse toggle */}
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
              <p className="text-xs" style={{ color: 'var(--text-2)', fontSize: '10px' }}>Intelligence Portal</p>
            </div>
          </div>
