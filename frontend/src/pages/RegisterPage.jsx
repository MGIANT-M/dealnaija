import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/ui'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') || 'investor'
  const ref = searchParams.get('ref') || ''

  const [form, setForm] = useState({
    role: defaultRole, full_name: '', email: '', phone: '',
    password: '', agency_name: '', ref
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.full_name || !form.email || !form.password) { setError('Please fill all required fields.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.role === 'agent' && !form.agency_name) { setError('Agency name is required for agents.'); return }
    setLoading(true)
    try {
      const user = await register(form)
      if (user.role === 'agent') navigate('/dashboard/agent')
      else navigate('/dashboard/investor')
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-earth-900">Join DealNaija</h1>
          <p className="text-earth-500 text-sm mt-1">Free account. Start in seconds.</p>
        </div>

        <div className="flex bg-earth-100 rounded-2xl p-1 mb-6">
          {['investor', 'agent'].map(r => (
            <button key={r} onClick={() => set('role', r)}
              className={'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ' + (form.role === r ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-500')}>
              {r === 'investor' ? '💰 Investor' : '🧑‍💼 Agent'}
            </button>
          ))}
        </div>

        {form.role === 'agent' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-700">
            ⏳ Agent accounts require admin approval before listing properties.
          </div>
        )}

        <div className="card p-6 space-y-4">
          {error && <Alert type="error" message={error} />}
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Full Name *</label>
            <input type="text" className="input-field" placeholder="Your full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Email Address *</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Phone Number</label>
            <input type="tel" className="input-field" placeholder="e.g. 08012345678" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          {form.role === 'agent' && (
            <div>
              <label className="text-xs font-medium text-earth-600 block mb-1">Agency Name *</label>
              <input type="text" className="input-field" placeholder="Your agency name" value={form.agency_name} onChange={e => set('agency_name', e.target.value)} />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Password *</label>
            <input type="password" className="input-field" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          {ref && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
              ✅ Referral code <strong>{ref}</strong> applied!
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
          <p className="text-center text-sm text-earth-500">
            Already have an account? <Link to="/login" className="text-brand-500 font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
