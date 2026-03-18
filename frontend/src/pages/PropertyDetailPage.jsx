import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Alert, Modal, TrustScore } from '../components/ui'
import { formatPrice, formatSize, VERIFICATION_BADGE, generateWhatsAppMessage } from '../utils/helpers'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [inspModal, setInspModal] = useState(false)
  const [inspForm, setInspForm] = useState({ preferred_date: '', preferred_time: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/properties/' + id)
      .then(r => setProperty(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const saveProperty = async () => {
    if (!user) { window.location.href = '/login'; return }
    try {
      await api.post('/properties/' + id + '/save')
      setSaved(true)
    } catch {}
  }

  const submitInspection = async () => {
    if (!user) { window.location.href = '/login'; return }
    setSubmitting(true)
    try {
      await api.post('/inspections', { property_id: id, ...inspForm })
      setSuccess(true)
      setInspModal(false)
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />
  if (!property) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h2 className="font-display font-bold text-2xl text-earth-900 mb-2">Property Not Found</h2>
      <Link to="/properties" className="btn-primary">Browse All Deals</Link>
    </div>
  )

  const badge = VERIFICATION_BADGE[property.verification_level] || VERIFICATION_BADGE.basic
  const whatsAppMsg = generateWhatsAppMessage(property)
  const agentWA = 'https://wa.me/' + (property.agent_phone || '').replace(/\D/g, '') + '?text=' + encodeURIComponent('Hello, I am interested in: ' + property.title)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {success && <div className="mb-4"><Alert type="success" message="Inspection request submitted! The agent will contact you shortly." /></div>}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-xs text-earth-500">
            <Link to="/properties" className="hover:text-earth-900">Listings</Link>
            <span>/</span>
            <span className="text-earth-700">{property.title}</span>
          </div>

          <div className="card overflow-hidden">
            <div className="aspect-[16/9] bg-earth-100 relative overflow-hidden">
              {property.images?.length > 0 ? (
                <img src={property.images[activeImg]?.image_url} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-earth-300 flex-col">
                  <span className="text-6xl">🗺️</span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                {property.distressed_deal && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600">🔥 Distressed</span>}
                <span className={'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ' + badge.color}>{badge.icon} {badge.label}</span>
              </div>
            </div>
            {property.images?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {property.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ' + (i === activeImg ? 'border-brand-500' : 'border-earth-100')}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 space-y-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-earth-900 mb-1">{property.title}</h1>
              <p className="text-earth-500 flex items-center gap-1 text-sm">📍 {[property.address, property.city, property.state].filter(Boolean).join(', ')}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: '💰', label: 'Price', value: formatPrice(property.price) + (property.price_negotiable ? ' (Neg.)' : '') },
                { icon: '📐', label: 'Land Size', value: formatSize(property.land_size, property.size_unit) },
                { icon: '🏦', label: 'Seller Type', value: (property.seller_type || '').replace('_', ' ') },
                { icon: '📄', label: 'Title Doc', value: (property.title_document || '').replace(/_/g, ' ') },
                { icon: '🗺️', label: 'State', value: property.state },
                { icon: '📅', label: 'Listed', value: new Date(property.created_at).toLocaleDateString('en-NG') },
              ].map(s => (
                <div key={s.label} className="bg-earth-50 rounded-xl p-3">
                  <p className="text-xs text-earth-500 mb-0.5">{s.icon} {s.label}</p>
                  <p className="font-semibold text-earth-900 text-sm capitalize">{s.value}</p>
                </div>
              ))}
            </div>
            {property.description && (
              <div>
                <h3 className="font-semibold text-earth-800 mb-2">Description</h3>
                <p className="text-earth-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}
            {property.inspection_instructions && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">🗓️ Inspection Instructions</p>
                <p className="text-sm text-blue-600">{property.inspection_instructions}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-earth-800 mb-3">Document Status</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'has_survey_plan', label: 'Survey Plan' },
                  { key: 'has_deed_of_assignment', label: 'Deed' },
                  { key: 'has_cof_o', label: 'C of O' },
                ].map(d => (
                  <div key={d.key} className={'rounded-xl p-3 text-center text-xs font-semibold border ' + (property[d.key] ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400')}>
                    <p className="text-xl mb-1">{property[d.key] ? '✅' : '○'}</p>
                    {d.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-earth-800 mb-3 flex items-center gap-2">🛡️ Trust Score</h3>
            <TrustScore score={parseFloat(property.trust_score) || 0} />
            <p className="text-xs text-earth-500 mt-2">Based on documents, verification, and inspections.</p>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-earth-800 mb-3">Listed by Agent</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-earth-200 flex items-center justify-center font-bold text-earth-700">
                {property.agent_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-earth-900 text-sm">{property.agent_name}</p>
                {property.agency_name && <p className="text-xs text-earth-500">{property.agency_name}</p>}
              </div>
            </div>
            <div className="space-y-2">
              {user?.role === 'investor' && !success && (
                <button onClick={() => setInspModal(true)} className="btn-primary w-full text-sm">🗓️ Request Inspection</button>
              )}
              {!user && (
                <Link to="/login" className="btn-primary w-full text-sm text-center block">Login to Request Inspection</Link>
              )}
              <a href={agentWA} target="_blank" rel="noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                💬 Contact Agent on WhatsApp
              </a>
              <button onClick={saveProperty} disabled={saved} className={'w-full btn-secondary text-sm ' + (saved ? 'opacity-60' : '')}>
                {saved ? '❤️ Saved!' : '🤍 Save Deal'}
              </button>
              <a href={'https://wa.me/?text=' + whatsAppMsg} target="_blank" rel="noreferrer" className="w-full bg-earth-100 hover:bg-earth-200 text-earth-700 text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                📤 Share via WhatsApp
              </a>
            </div>
          </div>

          {property.co_broker_enabled && (
            <div className="card p-5 border-brand-200 bg-brand-50">
              <h3 className="font-semibold text-brand-800 mb-2 flex items-center gap-2">🔗 Co-Broker Available</h3>
              <p className="text-xs text-brand-700 mb-3">Bring a buyer and earn <strong>{property.co_broker_commission_pct}%</strong> commission.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={inspModal} onClose={() => setInspModal(false)} title="Request Property Inspection">
        <div className="space-y-4">
          <p className="text-sm text-earth-600">Fill in your preferred inspection details.</p>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Preferred Date</label>
            <input type="date" className="input-field" value={inspForm.preferred_date} onChange={e => setInspForm(f => ({ ...f, preferred_date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Preferred Time</label>
            <select className="input-field" value={inspForm.preferred_time} onChange={e => setInspForm(f => ({ ...f, preferred_time: e.target.value }))}>
              <option value="">Select time slot</option>
              <option>9:00 AM - 11:00 AM</option>
              <option>11:00 AM - 1:00 PM</option>
              <option>2:00 PM - 4:00 PM</option>
              <option>4:00 PM - 6:00 PM</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Notes</label>
            <textarea className="input-field h-20 resize-none" placeholder="Any questions or requirements..." value={inspForm.notes} onChange={e => setInspForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setInspModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submitInspection} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
