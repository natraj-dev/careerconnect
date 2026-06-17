import { useState, useEffect } from 'react'
import { adminAPI, companiesAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Building2, CheckCircle, Search } from 'lucide-react'

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    companiesAPI.list()
      .then(r => setCompanies(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const verify = async (id: number) => {
    try {
      await adminAPI.verifyCompany(id)
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, is_verified: true } : c))
      toast.success('Company verified!')
    } catch { toast.error('Failed') }
  }

  const filtered = search ? companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) : companies

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
        <p className="text-gray-500 mt-1">{companies.length} companies registered</p>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="flex-1 outline-none text-sm placeholder-gray-400" placeholder="Search companies..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Company', 'Industry', 'Size', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.logo ? (
                        <img src={c.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.website && <a href={c.website} className="text-xs text-primary-600 hover:underline" target="_blank">Website</a>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.industry || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.company_size ? `${c.company_size} employees` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.is_verified ? '✓ Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!c.is_verified && (
                      <button onClick={() => verify(c.id)}
                        className="flex items-center gap-1 text-xs font-medium text-green-600 hover:bg-green-50 px-2.5 py-1 rounded-lg transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="w-8 h-8 mx-auto mb-2" />
              <p>No companies found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
