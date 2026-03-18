import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { Alert } from '../components/ui'
import { NIGERIAN_STATES, SELLER_TYPES, TITLE_DOCUMENTS, SIZE_UNITS } from '../utils/helpers'

const STEPS = ['Basic Info', 'Location', 'Pricing', 'Documents', 'Photos']

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '', description: '', property_type: 'land', seller_type: '',
    address: '', city: '', state: '', lga: '', latitude: '', longitude: '',
    land_size: '', size_unit: 'plot', price: '', price_negotiable: false,
    distressed_deal: false, discount_percentage: '',
    title_document: '', has_survey_plan: false, has_deed_of_assignment: false, has_cof_o: false,
    inspection_instructions: '', co_broker_enabled: false,
    co_broker_commission_pct: 2.5, agent_commission_pct: 5.0,
    images: ['', '', '']
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const nextStep = () => {
    if (step === 0 && (!form.title || !form.seller_type || !form.description)) {
      setError('Please fill in title, seller type, and description.'); return
    }
    if (step === 1 && (!form.city || !form.state)) {
      setError('Please enter city and state.'); return
    }
    if (step === 2 && (!form.land_size || !form.price)) {
      setError('Please enter land size and price.'); return
    }
    setError('')
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        land_size: parseFloat(form.land_size),
        price: parseFloat(form.price),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        discount_percentage: form.discount_percentage ? parseFloat(form.discount_percentage) : null,
        images: form.images.filter(i => i.trim())
      }
      await api.post('/properties', payload)
      navigate('/dashboard/agent')
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create listing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard/agent" className="text-earth-400 hover:text-earth-700 text-sm">← Dashboard</Link>
        <span className="text-earth-300">/</span>
        <span className="text-earth-700 text-sm font-medium">Add New Listing</span>
      </div>

      <h1 className="font-display font-bold text-2xl text-earth-900 mb-2">Add Property Listing</h1>
      <p className="text-earth-500 text-sm mb-6">Your listing will be reviewed by admin before going live.</p>

      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={'w-full h-1.5 rounded-full transition-all ' + (i <= step ? 'bg-brand-500' : 'bg-earth-100')} />
            <span className={'text-xs font-medium hidden sm:block ' + (i === step ? 'text-brand-600' : 'text-earth-400')}>{s}</span>
          </div>
        ))}
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      <div className="card p-6 space-y-4">
        {step === 0 && (
          <>
            <h2 className="font-semibold text-earth-800 text-lg">Basic Information</h2>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">Property Title *</label>
              <input className="input-field" placeholder="e.g. Bank-Liquidated Land - Lekki Phase 2" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">Property Type</label>
                <select className="input-field" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">Seller Type *</label>
                <select className="input-field" value={form.seller_type} onChange={e => set('seller_type', e.target.value)}>
                  <option value="">Select...</option>
                  {SELLER_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">Description *</label>
              <textarea className="input-field h-32 resize-none" placeholder="Describe the property in detail..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.distressed_deal} onChange={e => set('distressed_deal', e.target.checked)} className="w-4 h-4 accent-brand-500" />
              <span className="text-sm text-earth-700">Mark as Distressed Deal</span>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-semibold text-earth-800 text-lg">Location Details</h2>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">Full Address</label>
              <input className="input-field" placeholder="e.g. Plot 14, Admiralty Way, Lekki Phase 2" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">City / Area *</label>
                <input className="input-field" placeholder="e.g. Lekki" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">State *</label>
                <select className="input-field" value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">Select state...</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">LGA</label>
              <input className="input-field" placeholder="Local Government Area" value={form.lga} onChange={e => set('lga', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">GPS Latitude</label>
                <input type="number" className="input-field" placeholder="e.g. 6.4308" value={form.latitude} onChange={e => set('latitude', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">GPS Longitude</label>
                <input type="number" className="input-field" placeholder="e.g. 3.5792" value={form.longitude} onChange={e => set('longitude', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-earth-800 text-lg">Size & Pricing</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">Land Size *</label>
                <input type="number" className="input-field" placeholder="e.g. 900" value={form.land_size} onChange={e => set('land_size', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">Unit</label>
                <select className="input-field" value={form.size_unit} onChange={e => set('size_unit', e.target.value)}>
                  {SIZE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">Asking Price (₦) *</label>
              <input type="number" className="input-field" placeholder="e.g. 58500000" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-earth-700 cursor-pointer">
              <input type="checkbox" checked={form.price_negotiable} onChange={e => set('price_negotiable', e.target.checked)} className="accent-brand-500" />
              Price is negotiable
            </label>
            {form.distressed_deal && (
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">Discount % below market</label>
                <input type="number" className="input-field" placeholder="e.g. 32" value={form.discount_percentage} onChange={e => set('discount_percentage', e.target.value)} />
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold text-earth-800 text-lg">Title Documents</h2>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">Primary Title Document</label>
              <select className="input-field" value={form.title_document} onChange={e => set('title_document', e.target.value)}>
                <option value="">Select document type...</option>
                {TITLE_DOCUMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              {[
                { key: 'has_survey_plan', label: 'Survey Plan' },
                { key: 'has_deed_of_assignment', label: 'Deed of Assignment' },
                { key: 'has_cof_o', label: 'Certificate of Occupancy (C of O)' },
              ].map(d => (
                <label key={d.key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form[d.key]} onChange={e => set(d.key, e.target.checked)} className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm text-earth-700">{d.label}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">Inspection Instructions</label>
              <textarea className="input-field h-20 resize-none" placeholder="e.g. Available Mon-Fri 9AM-4PM..." value={form.inspection_instructions} onChange={e => set('inspection_instructions', e.target.value)} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-semibold text-earth-800 text-lg">Photos & Co-broker</h2>
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-2">Image URLs</label>
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input-field text-sm flex-1" placeholder={'Image ' + (i+1) + ' URL'} value={img} onChange={e => {
                    const imgs = [...form.images]
                    imgs[i] = e.target.value
                    set('images', imgs)
                  }} />
                </div>
              ))}
              <p className="text-xs text-earth-400">Upload photos to Imgur or Cloudinary and paste URLs here.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.co_broker_enabled} onChange={e => set('co_broker_enabled', e.target.checked)} className="w-4 h-4 accent-brand-500" />
              <span className="text-sm font-semibold text-earth-800">Enable Co-broker Network</span>
            </label>
            {form.co_broker_enabled && (
              <div>
                <label className="text-xs font-medium text-earth-600 block mb-1">Co-broker Commission %</label>
                <input type="number" className="input-field" placeholder="2.5" value={form.co_broker_commission_pct} onChange={e => set('co_broker_commission_pct', parseFloat(e.target.value))} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button onClick={() => { setError(''); setStep(s => s - 1) }} className="btn-secondary flex-1">← Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={nextStep} className="btn-primary flex-1">Next: {STEPS[step + 1]} →</button>
        ) : (
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : '🚀 Submit for Review'}
          </button>
        )}
      </div>
    </div>
  )
}
