import { useState } from 'react'
import { NIGERIAN_STATES, SELLER_TYPES } from '../../utils/helpers'

export default function PropertyFilters({ filters, onChange, onSearch }) {
  const [expanded, setExpanded] = useState(false)

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-4 mb-6">
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by city or keyword..."
            className="input-field pl-9 text-sm"
            value={filters.city || ''}
            onChange={e => handleChange('city', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
        </div>
        <button onClick={onSearch} className="btn-primary px-5 py-3 text-sm">Search</button>
        <button onClick={() => setExpanded(!expanded)} className="btn-secondary px-4 py-3 text-sm">
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { label: '🔥 Distressed', key: 'distressed', val: 'true' },
          { label: '✓✓ Verified', key: 'verification_level', val: 'fully_verified' },
          { label: '✓ Doc Verified', key: 'verification_level', val: 'document_verified' },
        ].map(f => (
          <button
            key={f.key + f.val}
            onClick={() => handleChange(f.key, filters[f.key] === f.val ? '' : f.val)}
            className={'text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ' + (filters[f.key] === f.val ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-earth-600 border-earth-200 hover:border-brand-300')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-earth-100 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">State</label>
            <select className="input-field text-sm" value={filters.state || ''} onChange={e => handleChange('state', e.target.value)}>
              <option value="">All States</option>
              {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Seller Type</label>
            <select className="input-field text-sm" value={filters.seller_type || ''} onChange={e => handleChange('seller_type', e.target.value)}>
              <option value="">All Sellers</option>
              {SELLER_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Sort By</label>
            <select className="input-field text-sm" value={filters.sort || 'newest'} onChange={e => handleChange('sort', e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="trust">Highest Trust Score</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Min Price (₦)</label>
            <input type="number" placeholder="0" className="input-field text-sm" value={filters.min_price || ''} onChange={e => handleChange('min_price', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Max Price (₦)</label>
            <input type="number" placeholder="No limit" className="input-field text-sm" value={filters.max_price || ''} onChange={e => handleChange('max_price', e.target.value)} />
          </div>
          <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
            <button onClick={() => { onChange({}); onSearch() }} className="btn-ghost text-sm text-earth-500">Clear All</button>
            <button onClick={onSearch} className="btn-primary text-sm py-2">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  )
}
