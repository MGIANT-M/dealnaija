import { useState, useEffect } from 'react'
import api from '../utils/api'
import { PageLoader, Alert } from '../components/ui'
import { formatPrice } from '../utils/helpers'

const TABS = ['Metrics', 'Pending Agents', 'Pending Listings']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Metrics')
  const [metrics, setMetrics] = useState(null)
  const [pendingAgents, setPendingAgents] = useState([])
  const [pendingProps, setPendingProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [m, a, p] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/agents/pending'),
        api.get('/admin/properties/pending'),
      ])
      setMetrics(m.data)
      setPendingAgents(a.data)
      setPendingProps(p.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const approveAgent = async (id) => {
    await api.put('/admin/agents/' + id + '/approve')
    setActionMsg('Agent approved!')
    load()
  }

  const updateProperty = async (id, status, verification_level) => {
    await api.put('/admin/properties/' + id + '/status', { status, verification_level })
    setActionMsg('Property ' + status + '!')
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-earth-900">Admin Panel</h1>
        <p className="text-earth-500 text-sm mt-0.5">Manage DealNaija platform</p>
      </div>

      {actionMsg && <div className="mb-4"><Alert type="success" message={actionMsg} /></div>}

      <div className="flex gap-1 overflow-x-auto mb-6 bg-earth-100 p-1 rounded-2xl">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ' + (tab === t ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-500 hover:text-earth-700')}>
            {t}
            {t === 'Pending Agents' && pendingAgents.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingAgents.length}</span>
            )}
            {t === 'Pending Listings' && pendingProps.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingProps.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'Metrics' && metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: metrics.users?.total || 0, icon: '👥', sub: (metrics.users?.agents || 0) + ' agents' },
            { label: 'Total Listings', value: metrics.properties?.total || 0, icon: '🏞️', sub: (metrics.properties?.approved || 0) + ' approved' },
            { label: 'Deals Closed', value: metrics.deals?.closed || 0, icon: '🤝', sub: (metrics.inspections?.total || 0) + ' inspections' },
            { label: 'Total Volume', value: formatPrice(metrics.deals?.total_volume || 0), icon: '💰', sub: 'all time' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-bold text-xl text-earth-900">{s.value}</div>
              <div className="text-sm font-medium text-earth-700 mt-0.5">{s.label}</div>
              <div className="text-xs text-earth-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Pending Agents' && (
        <div className="space-y-3">
          {pendingAgents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-earth-500">No pending agent approvals.</p>
            </div>
          ) : (
            pendingAgents.map(a => (
              <div key={a.id} className="card p-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-earth-900">{a.full_name}</p>
                  <p className="text-sm text-earth-500">{a.email} · {a.phone}</p>
                  {a.agency_name && <p className="text-xs text-earth-400">🏢 {a.agency_name}</p>}
                  <p className="text-xs text-earth-400">Applied: {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveAgent(a.id)} className="btn-primary text-sm py-2 px-4">✅ Approve</button>
                  <button onClick={() => api.put('/admin/users/' + a.id + '/deactivate').then(load)} className="btn-secondary text-sm py-2 px-4 text-red-500">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Pending Listings' && (
        <div className="space-y-4">
          {pendingProps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-earth-500">No listings awaiting review.</p>
            </div>
          ) : (
            pendingProps.map(p => (
              <div key={p.id} className="card p-4">
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-earth-100 flex-shrink-0">
                    {p.primary_image ? <img src={p.primary_image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🗺️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-earth-900">{p.title}</p>
                    <p className="text-sm text-earth-500">{p.city}, {p.state} · {formatPrice(p.price)}</p>
                    <p className="text-xs text-earth-400">Agent: {p.agent_name}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={() => updateProperty(p.id, 'approved', 'basic')} className="btn-primary text-xs py-2 px-3">✅ Approve</button>
                  <button onClick={() => updateProperty(p.id, 'approved', 'document_verified')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-2 rounded-xl">✓ Doc Verified</button>
                  <button onClick={() => updateProperty(p.id, 'approved', 'fully_verified')} className="text-xs bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-2 rounded-xl">✓✓ Fully Verified</button>
                  <button onClick={() => updateProperty(p.id, 'rejected', null)} className="btn-secondary text-xs py-2 px-3 text-red-500">❌ Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
