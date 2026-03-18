import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const dashboardPath = user?.role === 'agent' ? '/dashboard/agent'
    : user?.role === 'investor' ? '/dashboard/investor'
    : '/dashboard/admin'

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-earth-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-display font-bold text-lg text-earth-900">Deal<span className="text-brand-500">Naija</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/properties" className="btn-ghost text-sm">Browse Deals</Link>
            <Link to="/leaderboard" className="btn-ghost text-sm">Leaderboard</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="btn-ghost text-sm">Dashboard</Link>
                <button onClick={handleLogout} className="btn-ghost text-sm text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Join Free</Link>
              </>
            )}
          </nav>

          <button className="md:hidden p-2 rounded-lg hover:bg-earth-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5 w-5">
              <span className={'block h-0.5 bg-earth-700 transition-transform ' + (menuOpen ? 'rotate-45 translate-y-2' : '')} />
              <span className={'block h-0.5 bg-earth-700 transition-opacity ' + (menuOpen ? 'opacity-0' : '')} />
              <span className={'block h-0.5 bg-earth-700 transition-transform ' + (menuOpen ? '-rotate-45 -translate-y-2' : '')} />
            </div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-earth-100 px-4 py-3 space-y-1">
            <Link to="/properties" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Browse Deals</Link>
            <Link to="/leaderboard" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block btn-ghost w-full text-left text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block btn-primary w-full text-center mt-2" onClick={() => setMenuOpen(false)}>Join Free</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-earth-900 text-earth-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="font-display font-bold text-white">DealNaija</span>
            </div>
            <p className="text-sm text-earth-400 leading-relaxed">Nigeria's marketplace for verified land and distressed property deals.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Discover</h4>
            <ul className="space-y-2 text-sm text-earth-400">
              <li><Link to="/properties" className="hover:text-white transition-colors">All Listings</Link></li>
              <li><Link to="/properties?distressed=true" className="hover:text-white transition-colors">Distressed Deals</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors">Agent Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">For Agents</h4>
            <ul className="space-y-2 text-sm text-earth-400">
              <li><Link to="/register?role=agent" className="hover:text-white transition-colors">Become an Agent</Link></li>
              <li><Link to="/listings/new" className="hover:text-white transition-colors">Add a Listing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm text-earth-400">
              <li><a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">💬 WhatsApp Us</a></li>
              <li><span>📧 hello@dealnaija.com</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-earth-800 max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <p className="text-xs text-earth-500">© 2025 DealNaija. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
