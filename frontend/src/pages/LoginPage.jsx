import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/ui'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'agent') navigate('/dashboard/agent')
      else if (user.role === 'admin') navigate('/dashboard/admin')
      else navigate('/dashboard/investor')
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-earth-900">Welcome Back</h1>
          <p className="text-earth-500 text-sm mt-1">Login to your DealNaija account</p>
        </div>
        <div className="card p-6 space-y-4">
          {error && <Alert type="error" message={error} />}
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Email Address</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div>
            <label className="text-xs font-medium text-earth-600 block mb-1">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login →'}
          </button>
          <p className="text-center text-sm text-earth-500">
            No account? <Link to="/register" className="text-brand-500 font-semibold hover:text-brand-700">Register free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
