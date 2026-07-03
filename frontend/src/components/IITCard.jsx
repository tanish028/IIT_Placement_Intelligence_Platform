import { TrendingUp, Users, Award, ArrowRight } from './icons'
import { useNavigate } from 'react-router-dom'

// ── Campus images per IIT ────────────────────────────────────────
// Replace these with actual IIT campus photos for best results.
// Using picsum.photos seeds for consistent, beautiful placeholder images.
const IIT_IMAGES = {
  'IIT Bombay':    'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=280&fit=crop&auto=format',
  'IIT Delhi':     'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=600&h=280&fit=crop&auto=format',
  'IIT Madras':    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=280&fit=crop&auto=format',
  'IIT Kharagpur': 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=600&h=280&fit=crop&auto=format',
  'IIT Kanpur':    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=280&fit=crop&auto=format',
  'IIT Roorkee':   'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=280&fit=crop&auto=format',
  'IIT Guwahati':  'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=280&fit=crop&auto=format',
  'IIT Hyderabad': 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&h=280&fit=crop&auto=format',
  'IIT Gandhinagar':'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=280&fit=crop&auto=format',
  'IIT Jodhpur':   'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&h=280&fit=crop&auto=format',
  'IIT Patna':     'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600&h=280&fit=crop&auto=format',
  'IIT Indore':    'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=280&fit=crop&auto=format',
  'IIT Mandi':     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=280&fit=crop&auto=format',
}

const FALLBACK = 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=280&fit=crop&auto=format'

// ── Accent color per rank ────────────────────────────────────────
const RANK_COLORS = ['#F59E0B', '#8B5CF6', '#10B981', '#F472B6']

export default function IITCard({ data, rank = 0, onCompare }) {
  const navigate = useNavigate()
  const accentColor = RANK_COLORS[rank % RANK_COLORS.length]

  const institute = data.Institute || data.institute || 'IIT'
  const avgPkg    = data.avg_package     ? `₹${parseFloat(data.avg_package).toFixed(1)} LPA`   : 'N/A'
  const placement = data.avg_placement   ? `${parseFloat(data.avg_placement).toFixed(1)}%`      : 'N/A'
  const highest   = data.max_domestic    ? `₹${parseFloat(data.max_domestic).toFixed(1)} LPA`   : 'N/A'
  const imgSrc    = IIT_IMAGES[institute] || FALLBACK

  return (
    <div
      className="iit-card rounded-2xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: '#0D1526', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Campus Image */}
      <div className="relative overflow-hidden" style={{ height: '160px' }}>
        <img
          src={imgSrc}
          alt={`${institute} campus`}
          className="card-img"
          onError={e => { e.target.src = FALLBACK }}
        />
        {/* Dark gradient overlay so text stays readable */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(13,21,38,0.9) 0%, rgba(13,21,38,0.3) 60%, transparent 100%)' }}
        />
        {/* Rank badge */}
        <div
          className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: accentColor, color: '#05091A' }}
        >
          #{rank + 1}
        </div>
        {/* Institute name over image */}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-base leading-tight">{institute}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <TrendingUp size={14} color={accentColor} />
            </div>
            <p className="text-white font-bold text-sm">{avgPkg}</p>
            <p className="text-gray-500 text-xs mt-0.5">Avg Pkg</p>
          </div>
          <div className="text-center border-x border-gray-700/50">
            <div className="flex justify-center mb-1">
              <Users size={14} color="#34D399" />
            </div>
            <p className="text-white font-bold text-sm">{placement}</p>
            <p className="text-gray-500 text-xs mt-0.5">Placed</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Award size={14} color="#F472B6" />
            </div>
            <p className="text-white font-bold text-sm">{highest}</p>
            <p className="text-gray-500 text-xs mt-0.5">Highest</p>
          </div>
        </div>

        {/* Compare button */}
        <button
          onClick={() => {
            if (onCompare) onCompare(institute)
            else navigate(`/compare?iit=${encodeURIComponent(institute)}`)
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40` }}
        >
          Explore <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
