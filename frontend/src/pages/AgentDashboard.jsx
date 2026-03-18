import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { PageLoader, Alert, Modal } from '../components/ui'
import CommissionCalculator from '../components/dashboard/CommissionCalculator'
import DealPipeline from '../components/dashboard/DealPipeline'
import { formatPrice, formatSize, VERIFICATION_BADGE } from '../utils/helpers'

const TABS = ['Overview', 'My Listings', 'Inspections', 'Deals', 'Broadcasts', 'Commission']

export default function AgentDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [listings, setListings] = useState([])
  const [inspections, setInspections] = useState([])
  const [deals, setDeals] = useState([])
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [broadcastModal, setBroadcastModal] = useState(false)
  const [bcastForm, setBcastForm] = useState({ title: '', message: '', property_id: '', broadcast_type: 'deal_alert' })
  const [bcastLoading, setBcastLoading] = useState(false)
  const [bcastSuccess, setBcastSuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/properties/agent/my-listings'),
      api.get('/inspections'),
      api.get('/deals/my-deals'),
      api.get('/broadcasts'),
    ]).then(([l, i, d, b]) => {
      setListings(l.data)
      setInspections(i.data)
      setDeals(d.data)
      setBroadcasts(b.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const sendBroadcast = async () => {
    if (!bcastForm.title || !bcastForm.message) return
    setBcastLoading(true)
    try {
      await api.post('/broadcasts', bcastForm)
      setBcastSuccess(true)
      setBroadcastModal(false)
      const b = await api.get('/broadcasts')
      setBroadcasts(b.data)
    } catch {
      alert('Failed to send broadcast')
    } finally {
      setBcastLoading(false) }
  }

  const referralLink = window.location.origin + '/join?ref=' + (user?.referral_code || '')

  if (loading) return <PageLoader />
  if (!user?.is_approved) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">⏳</div>
      <h2 className="font-display font-bold text-2xl text-earth-900 mb-2">Account Pending Approval</h2>
      <p className="text-earth-500 mb-4">Your agent account is under review.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )

  const closedDeals = deals.filter(d => d.stage === 'deal_closed').length
  const totalCommission = deals.filter(d => d.stage === 'deal_closed').reduce((a, d) => a + (parseFloat(d.agent_commission_amount) || 0), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-earth-900">Agent Dashboard</h1>
          <p className="text-earth-500 text-sm mt-0.5">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setBroadcastModal(true)} className="btn-secondary text-sm">📡 Broadcast</button>
          <Link to="/listings/new" className="btn-primary text-sm">+ Add Listing</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Listings', value: listings.filter(l => l.status === 'approved').length, icon: '🏞️' },
          { label: 'Pending Listings', value: listings.filter(l => l.status === 'pending').length, icon: '⏳' },
          { label: 'Deals Closed', value: closedDeals, icon: '🤝' },
          { label: 'Commission', value: formatPrice(totalCommission), icon: '💰' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-bold text-xl text-earth-900">{s.value}</div>
            <div className="text-xs text-earth-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-earth-900 to-earth-700 text-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">🔗 Your Referral Link</p>
          <code className="text-brand-300 text-xs bg-earth-900/50 px-3 py-1.5 rounded-lg block truncate">{referralLink}</code>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(referralLink); alert('Copied!') }} className="btn-primary text-sm flex-shrink-0">Copy</button>
      </div>

      <div className="flex gap-1 overflow-x-auto mb-6 bg-earth-100 p-1 rounded-2xl">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (tab === t ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-500 hover:text-earth-700')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-earth-800 mb-4">📬 Recent Inspections</h3>
            {inspections.slice(0, 4).length === 0 ? <p className="text-earth-400 text-sm">No inspections yet.</p> :
              inspections.slice(0, 4).map(i => (
                <div key={i.id} className="flex items-start justify-between py-3 border-b border-earth-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-earth-900">{i.property_title}</p>
                    <p className="text-xs text-earth-500">{i.investor_name}</p>
                  </div>
                  <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (i.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>{i.status}</span>
                </div>
              ))
            }
          </div>
          <CommissionCalculator />
        </div>
      )}

      {tab === 'My Listings' && (
        <div>
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🏞️</p>
              <p className="text-earth-500 mb-4">No listings yet.</p>
              <Link to="/listings/new" className="btn-primary">+ Add First Listing</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(l => {
                const badge = VERIFICATION_BADGE[l.verification_level] || VERIFICATION_BADGE.basic
                return (
                  <div key={l.id} className="card p-4 flex gap-4 items-start">
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-earth-100 flex-shrink-0">
                      {l.primary_image ? <img src={l.primary_image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-earth-300 text-2xl">🗺️</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-earth-900 text-sm truncate">{l.title}</p>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={'inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ' + badge.color}>{badge.label}</span>
                          <span className={'text-xs px-2 py-1 rounded-full font-semibold capitalize ' + (l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600')}>{l.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-earth-500 mt-0.5">{l.city}, {l.state} · {formatSize(l.land_size, l.size_unit)} · {formatPrice(l.price)}</p>
                      <div className="flex gap-4 mt-1 text-xs text-earth-400">
                        <span>👁️ {l.views_count}</span>
                        <span>📋 {l.inspection_count}</span>
                      </div>
                    </div>
                    <Link to={'/properties/' + l.id} className="text-xs text-brand-500 font-semibold hover:underline flex-shrink-0">View →</Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'Inspections' && (
        <div className="space-y-3">
          {inspections.length === 0 ? <p className="text-earth-500 text-center py-8">No inspections yet.</p> :
            inspections.map(i => (
              <div key={i.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-earth-900">{i.property_title}</p>
                    <p className="text-sm text-earth-600">👤 {i.investor_name} · {i.investor_phone}</p>
                    <p className="text-xs text-earth-400">{i.preferred_date ? new Date(i.preferred_date).toLocaleDateString() : 'Any date'} · {i.preferred_time || 'Any time'}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (i.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>{i.status}</span>
                    <a href={'https://wa.me/' + (i.investor_phone || '').replace(/\D/g, '')} target="_blank" rel="noreferrer" className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-semibold">WhatsApp</a>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'Deals' && (
        <DealPipeline deals={deals} onUpdate={async () => { const d = await api.get('/deals/my-deals'); setDeals(d.data) }} />
      )}

      {tab === 'Broadcasts' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setBroadcastModal(true)} className="btn-primary text-sm">📡 Send Broadcast</button>
          </div>
          {bcastSuccess && <div className="mb-4"><Alert type="success" message="Broadcast sent!" /></div>}
          {broadcasts.slice(0, 10).map(b => (
            <div key={b.id} className="card p-4 mb-3">
              <p className="font-semibold text-earth-900 text-sm mb-1">{b.title}</p>
              <p className="text-sm text-earth-600 mb-1">{b.message}</p>
              <p className="text-xs text-earth-400">{new Date(b.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'Commission' && (
        <div className="max-w-md">
          <CommissionCalculator />
        </div>
      )}

      <Modal isOpen={broadcastModal} onClose={() => setBroadcastModal(false)} title="Broadcast a Deal">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Type</label>
            <select className="input-field" value={bcastForm.broadcast_type} onChange={e => setBcastForm(f => ({ ...f, broadcast_type: e.target.value }))}>
              <option value="deal_alert">Deal Alert</option>
              <option value="co_broker">Co-Broker Opportunity</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Title</label>
            <input className="input-field" placeholder="e.g. New bank land deal in Abuja" value={bcastForm.title} onChange={e => setBcastForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Message</label>
            <textarea className="input-field h-24 resize-none" placeholder="Describe the deal..." value={bcastForm.message} onChange={e => setBcastForm(f => ({ ...f, message: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setBroadcastModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={sendBroadcast} disabled={bcastLoading} className="btn-primary flex-1">{bcastLoading ? 'Sending...' : '📡 Send'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
