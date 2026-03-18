import { useState } from 'react'
import { DealStageBadge } from '../ui'
import { formatPrice } from '../../utils/helpers'
import api from '../../utils/api'

const STAGES = [
  { key: 'inquiry_received', label: '1. Inquiry', icon: '📩' },
  { key: 'inspection_scheduled', label: '2. Inspection', icon: '🗓️' },
  { key: 'negotiation', label: '3. Negotiation', icon: '🤝' },
  { key: 'deal_closed', label: '4. Closed', icon: '🎉' }
]

export default function DealPipeline({ deals, onUpdate }) {
  const [updating, setUpdating] = useState(null)

  const advanceStage = async (deal) => {
    const stages = STAGES.map(s => s.key)
    const idx = stages.indexOf(deal.stage)
    if (idx >= stages.length - 1) return
    const nextStage = stages[idx + 1]
    const agreedPrice = nextStage === 'deal_closed' ? prompt('Enter agreed price (₦):') : null
    setUpdating(deal.id)
    try {
      await api.put('/deals/' + deal.id + '/stage', { stage: nextStage, agreed_price: agreedPrice })
      onUpdate()
    } catch (e) {
      alert('Failed to update stage')
    } finally {
      setUpdating(null)
    }
  }

  if (!deals || deals.length === 0) {
    return <p className="text-earth-500 text-sm text-center py-8">No active deals yet.</p>
  }

  return (
    <div className="space-y-3">
      {deals.map(deal => (
        <div key={deal.id} className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-semibold text-earth-900 text-sm">{deal.property_title}</p>
              <p className="text-xs text-earth-500">{deal.city}, {deal.state}</p>
            </div>
            <DealStageBadge stage={deal.stage} />
          </div>
          <div className="flex gap-1 mb-3">
            {STAGES.map((s, i) => {
              const stageIdx = STAGES.findIndex(st => st.key === deal.stage)
              return <div key={s.key} className={'flex-1 h-1.5 rounded-full ' + (i <= stageIdx ? 'bg-brand-500' : 'bg-earth-100')} />
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-earth-500">
              {deal.agreed_price && <span className="font-semibold text-earth-700">{formatPrice(deal.agreed_price)}</span>}
            </div>
            {deal.stage !== 'deal_closed' && (
              <button onClick={() => advanceStage(deal)} disabled={updating === deal.id} className="text-xs btn-primary py-1.5 px-3">
                {updating === deal.id ? '...' : 'Advance Stage →'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
