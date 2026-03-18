import { useState, useEffect } from 'react'
import api from '../utils/api'
import { PageLoader } from '../components/ui'
import { formatPrice } from '../utils/helpers'

export default function LeaderboardPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('deals')

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(r => setAgents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...agents].sort((a, b) => {
    if (tab === 'deals') return b.deals_closed_count - a.deals_closed_count
    if (tab === 'referrals') return b.referral_count - a.referral_count
    return b.total_commission_earned - a.total_commission_earned
  })

  if (loading) return <PageLoader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="font-display font-bold text-3xl text-earth-900 mb-2">Agent Leaderboard</h1>
        <p className="text-earth-500">Nigeria's top-performing land deal agents</p>
      </div>

      <div className="flex bg-earth-100 p-1 rounded-2xl mb-6">
        {[
          { key: 'deals', label: '🤝 Deals Closed' },
          { key: 'referrals', label: '🔗 Referrals' },
          { key: 'commission', label: '💰 Commission' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ' + (tab === t.key ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-500')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((agent, i) => (
          <div key={agent.id} className={'card p-4 flex items-center gap-4 ' + (i === 0 ? 'border-yellow-200 bg-yellow-50' : '')}>
            <div className={'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ' + (i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-earth-300 text-earth-700' : i === 2 ? 'bg-orange-200 text-orange-800' : 'bg-earth-100 text-earth-500')}>
              {i + 1}
            </div>
            <div className="w-10 h-10 rounded-full bg-earth-200 flex items-center justify-center font-bold text-earth-700 flex-shrink-0">
              {agent.full_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-earth-900 text-sm truncate">{agent.full_name}</p>
              {agent.agency_name && <p className="text-xs text-earth-400 truncate">{agent.agency_name}</p>}
              <div className="flex gap-3 mt-0.5 text-xs text-earth-500">
                <span>⭐ {agent.reputation_score}/100</span>
                <span>✓ {agent.verified_listings_count} verified</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {tab === 'deals' && <p className="font-bold text-earth-900 text-lg">{agent.deals_closed_count}</p>}
              {tab === 'referrals' && <p className="font-bold text-earth-900 text-lg">{agent.referral_count}</p>}
              {tab === 'commission' && <p className="font-bold text-brand-600 text-sm">{formatPrice(agent.total_commission_earned)}</p>}
              <p className="text-xs text-earth-400">{tab === 'deals' ? 'deals' : tab === 'referrals' ? 'referrals' : 'earned'}</p>
            </div>
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-earth-500">Leaderboard will populate as agents close deals.</p>
        </div>
      )}
    </div>
  )
}
