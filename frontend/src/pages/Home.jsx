import { useEffect, useRef, useState } from 'react'
import { getSummary, getFilters, getComparison } from '../api/api'
import AnimatedNumber from '../components/AnimatedNumber'
import IITCard from '../components/IITCard'
import Spinner from '../components/Spinner'
import { TrendingUp, BookOpen, Cpu, ArrowRight, Zap, Scale, Sparkles } from '../components/icons'

// ── Scroll fade-in hook ───────────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

// ── Hero section background image ────────────────────────────────
// Replace this URL with an actual IIT campus aerial photo for best effect
const HERO_IMAGE = 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=700&fit=crop&auto=format&q=80'

export default function Home() {
  const [summary,    setSummary]    = useState(null)
  const [iitData,    setIITData]    = useState([])
  const [loading,    setLoading]    = useState(true)

  const heroRef    = useRef(null)
  const statsRef   = useFadeIn()
  const cardsRef   = useFadeIn()
  const featureRef = useFadeIn()

  useEffect(() => {
    // Load summary stats
    getSummary()
      .then(res => setSummary(res.data))
      .catch(() => {}) // show zeros if summary fails

    // Load IIT cards separately — failure here won't break the whole page
    getFilters()
      .then(async res => {
        const iits = res.data.institutes || []
        if (iits.length > 0) {
          try {
            const compRes = await getComparison(iits)
            setIITData(compRes.data || [])
          } catch (_) {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Parallax-lite: subtle background shift on scroll
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY * 0.3
        heroRef.current.style.backgroundPositionY = `-${y}px`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="page-enter -m-8">

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          minHeight: '420px',
          backgroundImage: `url("${HERO_IMAGE}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(5,9,26,0.75) 0%, rgba(5,9,26,0.85) 70%, #05091A 100%)',
          }}
        />
        {/* Ambient orbs */}
        <div className="hero-orb-1" style={{ top: '-100px', left: '-100px' }} />
        <div className="hero-orb-2" style={{ bottom: '0px', right: '-80px' }} />

        {/* Content */}
        <div className="relative z-10 px-8 py-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              backgroundColor: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: '#F59E0B',
            }}
          >
            <Zap size={12} />
            India's Most Comprehensive IIT Placement Hub
          </div>

          <h1
            className="font-black text-5xl md:text-6xl leading-tight mb-4"
            style={{ color: '#ffffff', letterSpacing: '-0.02em' }}
          >
            Decode IIT Placements.<br />
            <span className="gradient-text">Make Smarter Choices.</span>
          </h1>

          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'rgba(203,213,225,0.85)' }}>
            Compare packages, placement trends, and sector data across{' '}
            <strong style={{ color: '#F59E0B' }}>13 IITs</strong> from 2021–2025.
            Powered by real data and ML predictions.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#05091A',
                boxShadow: '0 8px 20px rgba(245,158,11,0.35)',
              }}
            >
              Compare IITs <ArrowRight size={16} />
            </a>
            <a
              href="/predict"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 hover:bg-white/10"
              style={{ color: '#818CF8', borderColor: 'rgba(139,92,246,0.5)' }}
            >
              Try ML Prediction
            </a>
          </div>
        </div>
      </div>

      <div className="px-8 pb-12">

        {/* ── Animated Stat Counters ────────────────────────────── */}
        <div ref={statsRef} className="fade-in-section grid grid-cols-2 md:grid-cols-4 gap-4 -mt-8 mb-12 relative z-10">
          {[
            { label: 'IITs Covered',     value: summary?.total_institutes || 13,  suffix: '',     prefix: '',   decimals: 0, glow: 'amber',   icon: <BookOpen size={18} color="#F59E0B" /> },
            { label: 'Avg Package',       value: summary?.avg_package_lpa  || 18,  suffix: ' LPA', prefix: '₹',  decimals: 1, glow: 'violet',  icon: <TrendingUp size={18} color="#8B5CF6" /> },
            { label: 'Avg Placement %',   value: summary?.avg_placement_pct|| 82,  suffix: '%',    prefix: '',   decimals: 1, glow: 'emerald', icon: <Cpu size={18} color="#34D399" /> },
            { label: 'Years of Data',     value: summary?.years_covered    || 5,   suffix: ' yrs', prefix: '',   decimals: 0, glow: 'rose',    icon: <Zap size={18} color="#F472B6" /> },
          ].map((s) => (
            <div
              key={s.label}
              className="card-gradient-border rounded-2xl p-5 text-center"
              style={{ backgroundColor: '#0D1526' }}
            >
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className={`text-3xl font-black mb-1 stat-glow-${s.glow}`}
                 style={{ color: s.glow === 'amber' ? '#F59E0B' : s.glow === 'violet' ? '#8B5CF6' : s.glow === 'emerald' ? '#34D399' : '#F472B6' }}>
                <AnimatedNumber value={s.value} suffix={s.suffix} prefix={s.prefix} decimals={s.decimals} />
              </p>
              <p className="text-xs font-medium" style={{ color: '#64748B' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── IIT Cards Grid ────────────────────────────────────── */}
        <div ref={cardsRef} className="fade-in-section mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Explore IITs</h2>
              <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
                Click any card to compare placement data
              </p>
            </div>
            <a
              href="/compare"
              className="text-sm font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: '#F59E0B' }}
            >
              View all <ArrowRight size={14} />
            </a>
          </div>

          {iitData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {iitData.map((iit, i) => (
                <IITCard key={iit.Institute || i} data={iit} rank={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No IIT data available. Make sure the backend is running.</p>
            </div>
          )}
        </div>

        {/* ── Feature Highlights ────────────────────────────────── */}
        <div ref={featureRef} className="fade-in-section">
          <h2 className="text-xl font-bold text-white mb-6">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon:  <Scale size={22} color="#F59E0B" />,
                title: 'Compare IITs',
                desc:  'Side-by-side packages, placement %, and sector distribution across any combination of institutes.',
                color: '#F59E0B',
                href:  '/compare',
              },
              {
                icon:  <TrendingUp size={22} color="#8B5CF6" />,
                title: 'Trend Analysis',
                desc:  'Track year-over-year salary growth and placement rate changes from 2021 to 2025.',
                color: '#8B5CF6',
                href:  '/trends',
              },
              {
                icon:  <Sparkles size={22} color="#34D399" />,
                title: 'ML Predictions',
                desc:  'Predict expected package and placement % for any IIT, branch, program, and year using trained ML models.',
                color: '#34D399',
                href:  '/predict',
              },
            ].map(f => (
              <a
                key={f.title}
                href={f.href}
                className="group block rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: '#0D1526',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: `0 0 0 0 ${f.color}20`,
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 30px ${f.color}20`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 transparent'}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${f.color}15` }}
                >
                  {f.icon}
                </div>
                <p className="font-bold text-white mb-2 group-hover:text-opacity-90">{f.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{f.desc}</p>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         