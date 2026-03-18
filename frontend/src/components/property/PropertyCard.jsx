import { Link } from 'react-router-dom'
import { formatPrice, formatSize, VERIFICATION_BADGE, generateWhatsAppMessage } from '../../utils/helpers'

export default function PropertyCard({ property }) {
  const badge = VERIFICATION_BADGE[property.verification_level] || VERIFICATION_BADGE.basic

  const shareToWhatsApp = (e) => {
    e.preventDefault()
    const msg = generateWhatsAppMessage(property)
    window.open('https://wa.me/?text=' + msg, '_blank')
  }

  return (
    <div className="card group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] bg-earth-100 overflow-hidden">
        {property.primary_image ? (
          <img src={property.primary_image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-earth-300">
            <span className="text-4xl">🗺️</span>
            <span className="text-xs mt-1">No image</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {property.distressed_deal && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600">🔥 Distressed</span>}
          <span className={'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ' + badge.color}>{badge.icon} {badge.label}</span>
        </div>
        <button onClick={shareToWhatsApp} className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors flex items-center gap-1 shadow">
          <span>📤</span> Share
        </button>
        {property.discount_percentage && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{property.discount_percentage}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-earth-900 text-sm leading-snug line-clamp-2 mb-1">{property.title}</h3>
        <p className="text-xs text-earth-500 mb-3 flex items-center gap-1">
          <span>📍</span>{[property.city, property.state].filter(Boolean).join(', ')}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-brand-600 font-bold text-base">{formatPrice(property.price)}</p>
            <p className="text-xs text-earth-400">{formatSize(property.land_size, property.size_unit)}</p>
          </div>
          <span className="text-xs bg-earth-100 text-earth-600 px-2 py-1 rounded-full capitalize">{(property.seller_type || '').replace('_', ' ')}</span>
        </div>

        {property.trust_score > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-earth-500 mb-1">
              <span>Trust Score</span>
              <span className="font-semibold text-earth-700">{property.trust_score}/100</span>
            </div>
            <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-green-500 transition-all" style={{ width: property.trust_score + '%' }} />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Link to={'/properties/' + property.id} className="flex-1 bg-earth-900 hover:bg-earth-700 text-white text-sm font-semibold py-2 px-4 rounded-xl text-center transition-colors">
            View Details
          </Link>
          {property.co_broker_enabled && (
            <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-2 py-2 rounded-xl font-medium whitespace-nowrap">Co-broker</span>
          )}
        </div>
      </div>
    </div>
  )
}
