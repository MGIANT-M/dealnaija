import { useState } from 'react'
import { formatPrice } from '../../utils/helpers'

export default function CommissionCalculator() {
  const [price, setPrice] = useState('')
  const [commissionPct, setCommissionPct] = useState(5)
  const [coBrokerPct, setCoBrokerPct] = useState(0)

  const priceNum = parseFloat(price) || 0
  const total = priceNum * (commissionPct / 100)
  const coBroker = priceNum * (coBrokerPct / 100)
  const agentNet = total - coBroker

  return (
    <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-sm">
      <h3 className="font-display font-semibold text-earth-900 mb-4 flex items-center gap-2">
        <span>🧮</span> Commission Calculator
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-earth-600 block mb-1">Property Price (₦)</label>
          <input
            type="number"
            placeholder="e.g. 50000000"
            className="input-field"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Your Commission %</label>
            <input type="number" min="0" max="20" step="0.5" className="input-field" value={commissionPct} onChange={e => setCommissionPct(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Co-broker %</label>
            <input type="number" min="0" max="10" step="0.5" className="input-field" value={coBrokerPct} onChange={e => setCoBrokerPct(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        {priceNum > 0 && (
          <div className="bg-earth-50 rounded-xl p-4 space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-earth-600">Total Commission</span>
              <span className="font-bold text-earth-900">{formatPrice(total)}</span>
            </div>
            {coBrokerPct > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-earth-600">Co-broker Share</span>
                <span className="font-semibold text-earth-700">{formatPrice(coBroker)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-earth-200">
              <span className="text-earth-700 font-medium">Your Net Earnings</span>
              <span className="font-bold text-brand-600 text-base">{formatPrice(agentNet)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
