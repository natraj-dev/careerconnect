import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { companiesAPI } from '../../services/api'
import { Building2, Globe, Users, MapPin, Search } from 'lucide-react'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    companiesAPI.list().then(r => setCompanies(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = search ? companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  ) : companies

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Top Companies Hiring</h1>
        <p className="text-gray-500 mt-2">Discover great places to work</p>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-md mx-auto mb-8 shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input className="flex-1 outline-none text-sm placeholder-gray-400" placeholder="Search companies or industries..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <div key={i} className="card h-40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c: any) => (
            <Link key={c.id} to={`/companies/${c.id}`}
              className="card hover:shadow-md transition-shadow group border border-gray-100">
              <div className="flex items-start gap-4 mb-4">
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                ) : (
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{c.name}</h3>
                  <p className="text-sm text-gray-500">{c.industry || 'Company'}</p>
                  {c.is_verified && <span className="badge bg-green-100 text-green-700 text-xs mt-1">✓ Verified</span>}
                </div>
              </div>

              {c.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description}</p>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-auto">
                {c.company_size && (
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.company_size} employees</span>
                )}
                {c.headquarters && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.headquarters}</span>
                )}
                {c.website && (
                  <span className="flex items-center gap-1 text-primary-500"><Globe className="w-3 h-3" />Website</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
