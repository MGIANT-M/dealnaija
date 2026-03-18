import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import PropertyCard from '../components/property/PropertyCard'
import { PageLoader } from '../components/ui'
import { WHATSAPP_NUMBER } from '../utils/helpers'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/properties/featured')
      .then(r => setFeatured(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = () => {
    if (search.trim()) navigate('/properties?city=' + encodeURIComponent(search))
    else navigate('/properties')
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-earth-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #ff7a0f 0%, transparent 50%), radial-gradient(circle at 80% 20%, #9d7744 0%, transparent 40%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              Nigeria's #1 Verified Land Deal Marketplace
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Verified Land &<br />
              <span className="text-brand-400">Distressed Property</span><br />
              Deals in Nigeria
            </h1>
            <p className="text-earth-300 text-lg mb-8 leading-relaxed">
              Connect with bank-liquidated properties, private distressed deals, and verified land opportunities.
            </p>
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 max-w-lg">
              <input
                type="text"
                placeholder="Search by city, state, or area..."
                className="flex-1 bg-transparent text-white placeholder-earth-400 px-3 py-2 text-sm outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} className="btn-primary text-sm py-2 px-5 flex-shrink-0">Find Deals</button>
            </div>
            <div className="flex gap-6 mt-8">
              {[
                { label: 'Active Listings', value: '200+' },
                { label: 'Verified Agents', value: '80+' },
                { label: 'Deals Closed', value: '₦2B+' },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-display font-bold text-2xl text-white">{s.value}</p>
                  <p className="text-earth-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-earth-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {[
            { label: '🔥 Distressed Deals', href: '/properties?distressed=true' },
            { label: '🏦 Bank Liquidations', href: '/properties?seller_type=bank' },
            { label: '✓✓ Fully Verified', href: '/properties?verification_level=fully_verified' },
            { label: '📍 Lagos', href: '/properties?state=Lagos' },
            { label: '📍 Abuja', href: '/properties?state=FCT - Abuja' },
            { label: '📍 Rivers', href: '/properties?state=Rivers' },
          ].map(c => (
            <Link key={c.label} to={c.href} className="whitespace-nowrap text-xs font-medium px-3 py-2 rounded-full border border-earth-200 hover:border-brand-400 hover:text-brand-600 transition-colors bg-white text-earth-700">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-earth-900">Featured Deals</h2>
              <p className="text-earth-500 text-sm mt-1">Handpicked verified opportunities</p>
            </div>
            <Link to="/properties" className="text-brand-500 font-semibold text-sm hover:text-brand-700">View all →</Link>
          </div>
          {loading ? <PageLoader /> : featured.length === 0 ? (
            <div className="text-center py-12 text-earth-400">
              <p className="text-4xl mb-2">🏞️</p>
              <p>No listings yet!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featured.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </section>

        <section className="py-12 border-t border-earth-100">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-earth-900 text-center mb-2">How DealNaija Works</h2>
          <p className="text-earth-500 text-center text-sm mb-10">Simple, transparent, secure.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', step: '01', title: 'Discover Deals', desc: 'Browse hundreds of verified land and distressed property deals across Nigeria.' },
              { icon: '📋', step: '02', title: 'Request Inspection', desc: 'Schedule an on-ground inspection directly through the platform.' },
              { icon: '🤝', step: '03', title: 'Close the Deal', desc: 'Negotiate, finalize, and close. Commission splits tracked automatically.' },
            ].map(s => (
              <div key={s.step} className="bg-earth-50 rounded-2xl p-6">
                <div className="text-4xl mb-4">{s.icon}</div>
                <span className="font-mono text-xs text-earth-400 font-bold">{s.step}</span>
                <h3 className="font-display font-semibold text-earth-900 text-lg mt-1 mb-2">{s.title}</h3>
                <p className="text-earth-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 border-t border-earth-100">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="gradient-earth text-white rounded-2xl p-8">
              <div className="text-4xl mb-4">🧑‍💼</div>
              <h3 className="font-display font-bold text-2xl mb-2">Join as an Agent</h3>
              <p className="text-earth-200 text-sm mb-5">List deals, earn co-broker commissions, grow your network.</p>
              <Link to="/register?role=agent" className="inline-block bg-white text-earth-900 font-bold px-6 py-3 rounded-xl hover:bg-earth-100 transition-colors text-sm">
                Register as Agent →
              </Link>
            </div>
            <div className="bg-earth-900 text-white rounded-2xl p-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-display font-bold text-2xl mb-2">Join as an Investor</h3>
              <p className="text-earth-300 text-sm mb-5">Access exclusive distressed deals and request inspections.</p>
              <Link to="/register?role=investor" className="inline-block btn-primary px-6 py-3 text-sm">
                Register as Investor →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <a href={'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hello DealNaija, I want to learn more about property deals.')}
        target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-4 z-40 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105">
        <span className="text-lg">💬</span>
        <span className="hidden sm:block">WhatsApp Us</span>
      </a>
    </div>
  )
}
