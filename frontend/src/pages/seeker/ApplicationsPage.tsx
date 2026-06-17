import { useState, useEffect } from 'react'
import { applicationsAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ClipboardList, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  INTERVIEWED: 'bg-cyan-100 text-cyan-700',
  OFFERED: 'bg-green-100 text-green-700',
  HIRED: 'bg-green-200 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadApps() }, [])

  const loadApps = async () => {
    try { const { data } = await applicationsAPI.myApplications(); setApplications(data) }
    catch { toast.error('Failed to load applications') }
    finally { setLoading(false) }
  }

  const handleWithdraw = async (id: number) => {
    if (!confirm('Withdraw this application?')) return
    try {
      await applicationsAPI.withdraw(id)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'WITHDRAWN' } : a))
      toast.success('Application withdrawn')
    } catch { toast.error('Failed to withdraw') }
  }

  const filtered = filter ? applications.filter(a => a.status === filter) : applications

  const statusCounts = applications.reduce((acc: any, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track all your job applications</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button key={status} onClick={() => setFilter(filter === status ? '' : status)}
            className={`p-3 rounded-xl text-center border-2 transition-all ${filter === status ? 'border-primary-500 bg-primary-50' : 'border-transparent bg-white shadow-sm'}`}>
            <div className="text-xl font-bold text-gray-900">{count as number}</div>
            <div className={`badge ${STATUS_COLORS[status]} mt-1 text-xs`}>{status.replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            {filter ? 'No applications with this status' : 'No applications yet'}
          </h3>
          {!filter && <Link to="/jobs" className="btn-primary mt-4 inline-block">Browse Jobs</Link>}
          {filter && <button onClick={() => setFilter('')} className="text-primary-600 text-sm hover:underline mt-2">Clear filter</button>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => (
            <div key={app.id} className="card flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <Link to={`/jobs/${app.job_id}`} className="font-semibold text-gray-900 hover:text-primary-600 flex items-center gap-1">
                    Job #{app.job_id} <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className={`badge ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {app.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                  {app.recruiter_notes && <span className="ml-3 text-gray-600">💬 Recruiter note: {app.recruiter_notes}</span>}
                </div>
              </div>
              {app.status !== 'WITHDRAWN' && app.status !== 'HIRED' && app.status !== 'REJECTED' && (
                <button onClick={() => handleWithdraw(app.id)}
                  className="ml-4 text-sm text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap">
                  Withdraw
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
