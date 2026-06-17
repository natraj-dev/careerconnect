import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Users, Search, ToggleLeft, ToggleRight } from 'lucide-react'

const ROLE_COLORS: Record<string, string> = {
  JOB_SEEKER: 'bg-blue-100 text-blue-700',
  RECRUITER: 'bg-green-100 text-green-700',
  ADMIN: 'bg-purple-100 text-purple-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { loadUsers() }, [page, roleFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 20 }
      if (roleFilter) params.role = roleFilter
      const { data } = await adminAPI.users(params)
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const toggleActive = async (userId: number) => {
    try {
      await adminAPI.toggleUserActive(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u))
      toast.success('User status updated')
    } catch { toast.error('Failed') }
  }

  const filtered = search ? users.filter(u => u.email.toLowerCase().includes(search.toLowerCase())) : users

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">{total.toLocaleString()} total users</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="flex-1 outline-none text-sm placeholder-gray-400" placeholder="Search by email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto text-sm" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="JOB_SEEKER">Job Seekers</option>
          <option value="RECRUITER">Recruiters</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Email', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">#{user.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                  <td className="px-4 py-3"><span className={`badge ${ROLE_COLORS[user.role]}`}>{user.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.is_verified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.is_verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(user.id)}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                      {user.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm disabled:opacity-40">Previous</button>
          <span className="flex items-center text-sm text-gray-600">Page {page}</span>
          <button disabled={users.length < 20} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
