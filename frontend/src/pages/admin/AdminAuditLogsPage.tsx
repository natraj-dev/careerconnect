import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Shield, Search, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const ACTION_COLORS: Record<string, string> = {
  USER_REGISTERED: 'bg-green-100 text-green-700',
  USER_LOGIN: 'bg-blue-100 text-blue-700',
  USER_LOGOUT: 'bg-gray-100 text-gray-600',
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => { loadLogs() }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.auditLogs({ page, page_size: 50 })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load audit logs') }
    finally { setLoading(false) }
  }

  const filtered = search ? logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
    String(l.user_id).includes(search)
  ) : logs

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">{total.toLocaleString()} total entries</p>
        </div>
        <button onClick={loadLogs} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="flex-1 outline-none text-sm placeholder-gray-400" placeholder="Search actions..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(10)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Time', 'User ID', 'Action', 'Entity', 'IP Address', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.user_id ? `#${log.user_id}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.entity_type ? `${log.entity_type} #${log.entity_id}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{log.ip_address || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p>No audit logs found</p>
            </div>
          )}
        </div>
      )}

      {total > 50 && (
        <div className="flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm disabled:opacity-40">Previous</button>
          <span className="flex items-center text-sm text-gray-600">Page {page}</span>
          <button disabled={logs.length < 50} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
