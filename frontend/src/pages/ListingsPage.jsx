import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import PropertyCard from '../components/property/PropertyCard'
import PropertyFilters from '../components/property/PropertyFilters'
import { PageLoader, EmptyState } from '../components/ui'

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    seller_type: searchParams.get('seller_type') || '',
    verification_level: searchParams.get('verification_level') || '',
    distressed: searchParams.get('distressed') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest',
  })

  const fetchProperties = async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 12, ...filters }
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
      const res = await api.get('/properties', { params })
      setProperties(res.data.properties)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
      setPage(p)
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties(1) }, [])

  const handleSearch = () => {
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
    fetchProperties(1)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-earth-900">Browse Property Deals</h1>
        <p className="text-earth-500 text-sm mt-1">{loading ? 'Loading...' : total.toLocaleString() + ' listing' + (total !== 1 ? 's' : '') + ' found'}</p>
      </div>

      <PropertyFilters filters={filters} onChange={setFilters} onSearch={handleSearch} />

      {loading ? (
        <PageLoader />
      ) : properties.length === 0 ? (
        <EmptyState
          icon="🏞️"
          title="No listings found"
          description="Try adjusting your filters or search in a different area."
          action={<button onClick={() => { setFilters({ sort: 'newest' }); fetchProperties(1) }} className="btn-primary">Clear Filters</button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button disabled={page === 1} onClick={() => fetchProperties(page - 1)} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button key={p} onClick={() => fetchProperties(p)} className={'w-9 h-9 rounded-xl text-sm font-semibold transition-colors ' + (p === page ? 'bg-brand-500 text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200')}>
                      {p}
                    </button>
                  )
                })}
              </div>
              <button disabled={page === totalPages} onClick={() => fetchProperties(page + 1)} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
