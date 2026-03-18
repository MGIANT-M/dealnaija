import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { PageLoader, Modal, Alert } from '../components/ui'
import PropertyCard from '../components/property/PropertyCard'

const TABS = ['Browse Deals', 'Saved Properties', 'My Inspections', 'Deal Feed']

export default function InvestorDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Browse Deals')
  const [properties, setProperties] = useState([])
  const [saved, setSaved] = useState([])
  const [inspections, setInspections] = useState([])
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifyModal, setVerifyModal] = useState(null)
  const [verifyForm, setVerifyForm] = useState({ investor_rating: 5, investor_feedback: '', property_matches_listing: true })
  const [verifySuccess, setVerifySuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/properties?limit=12&sort=trust'),
      api.get('/properties/saved/list'),
      api.get('/inspections'),
      api.get('/broadcasts'),
    ]).then(([p, s, i, b]) => {
      setProperties(p.data.properties || [])
      setSaved(s.data)
      setInspections(i.data)
      setBroadcasts(b.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const submitVerification = async () => {
    try {
      await api.put('/inspections/' + verifyModal + '/verify', verifyForm)
      setVerifySuccess(true)
      setVerifyModal(null)
      const i = await api.get('/inspections')
      setInspections(i.data)
    } catch { alert('Failed to submit') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-earth-900">Investor Dashboard</h1>
          <p className="text-earth-500 text-sm mt-0.5">Welcome, {user?.full_name?.split(' ')[0]}! 👋</p>
        </div>
        <Link to="/properties" className="btn-primary text-sm">Browse All Deals →</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Saved Deals', value: saved.length, icon: '❤️' },
          { label: 'Inspections Sent', value: inspections.length, icon: '🗓️' },
          { label: 'Completed', value: inspections.filter(i => i.status === 'completed').length, icon: '✅' },
          { label: 'Pending', value: inspections.filter(i => i.status === 'pending').length, icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-bold text-xl text-earth-900">{s.value}</div>
            <div className="text-xs text-earth-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {verifySuccess && <div className="mb-4"><Alert type="success" message="Inspection verified! Thank you for your feedback." /></div>}

      <div className="flex gap-1 overflow-x-auto mb-6 bg-earth-100 p-1 rounded-2xl">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (tab === t ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-500 hover:text-earth-700')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Browse Deals' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
          <div className="text-center mt-6">
            <Link to="/properties" className="btn-secondary">View All Listings →</Link>
          </div>
        </div>
      )}

      {tab === 'Saved Properties' && (
        <div>
          {saved.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🤍</p>
              <p className="text-earth-500 mb-4">No saved properties yet.</p>
              <Link to="/properties" className="btn-primary">Browse Deals</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {saved.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'My Inspections' && (
        <div className="space-y-3">
          {inspections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🗓️</p>
              <p className="text-earth-500">No inspection requests yet.</p>
            </div>
          ) : (
            inspections.map(i => (
              <div key={i.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-earth-900">{i.property_title}</p>
                    <p className="text-sm text-earth-500">{i.city}, {i.state}</p>
                    <p className="text-xs text-earth-400">Agent: {i.agent_name}</p>
                    {i.scheduled_at && <p className="text-xs text-blue-600 font-medium mt-1">📅 {new Date(i.scheduled_at).toLocaleString()}</p>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (i.status === 'completed' ? 'bg-green-100 text-green-700' : i.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700')}>{i.status}</span>
                    {i.status === 'completed' && !i.investor_confirmed && (
                      <button onClick={() => setVerifyModal(i.id)} className="text-xs btn-primary py-1.5 px-3">Verify</button>
                    )}
                    {i.investor_confirmed && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✅ Verified</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Deal Feed' && (
        <div className="space-y-3">
          {broadcasts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📡</p>
              <p className="text-earth-500">No broadcasts yet.</p>
            </div>
          ) : (
            broadcasts.map(b => (
              <div key={b.id} className="card p-4">
                <p className="font-semibold text-earth-900 text-sm mb-1">{b.title}</p>
                <p className="text-sm text-earth-600 mb-2">{b.message}</p>
                <p className="text-xs text-earth-400">{b.sender_name} · {new Date(b.created_at).toLocaleDateString()}</p>
                {b.property_id && <Link to={'/properties/' + b.property_id} className="mt-2 text-xs text-brand-500 font-semibold inline-block">View Property →</Link>}
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={!!verifyModal} onClose={() => setVerifyModal(null)} title="Verify Your Inspection">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-2">Does the property match the listing?</label>
            <div className="flex gap-3">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setVerifyForm(f => ({ ...f, property_matches_listing: v }))}
                  className={'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ' + (verifyForm.property_matches_listing === v ? (v ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500') : 'bg-white text-earth-700 border-earth-200')}>
                  {v ? '✅ Yes' : '❌ No'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-2">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setVerifyForm(f => ({ ...f, investor_rating: n }))}
                  className={'w-10 h-10 rounded-xl text-lg transition-all ' + (verifyForm.investor_rating >= n ? 'bg-yellow-400' : 'bg-earth-100')}>⭐</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Feedback</label>
            <textarea className="input-field h-20 resize-none" placeholder="What did you see on the ground?" value={verifyForm.investor_feedback} onChange={e => setVerifyForm(f => ({ ...f, investor_feedback: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setVerifyModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submitVerification} className="btn-primary flex-1">Submit</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
