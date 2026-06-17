import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Briefcase, PlusCircle, Edit2, Trash2, Eye, Users, Globe, PauseCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-orange-100 text-orange-700',
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    try {
      const { data } = await jobsAPI.list({ page_size: 100 })
      setJobs(data.jobs || [])
    } catch { toast.error('Failed to load jobs') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job posting?')) return
    try {
      await jobsAPI.delete(id)
      setJobs(prev => prev.filter(j => j.id !== id))
      toast.success('Job deleted')
    } catch { toast.error('Failed to delete job') }
  }

  const handlePublish = async (id: number) => {
    try {
      await jobsAPI.publish(id)
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'PUBLISHED' } : j))
      toast.success('Job published!')
    } catch { toast.error('Failed to publish') }
  }

  const filtered = filter ? jobs.filter(j => j.status === filter) : jobs

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-500 mt-1">{jobs.length} total postings</p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PUBLISHED', 'DRAFT', 'CLOSED', 'PAUSED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
            {s || 'All'} {s && `(${jobs.filter(j => j.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">{filter ? 'No jobs with this status' : 'No jobs posted yet'}</h3>
          {!filter && <Link to="/recruiter/jobs/create" className="btn-primary mt-4 inline-block">Post Your First Job</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job: any) => (
            <div key={job.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <span className={`badge ${STATUS_STYLES[job.status]}`}>{job.status}</span>
                  {job.is_featured && <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>}
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applications_count} applicants</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views_count} views</span>
                  <span>{job.job_type?.replace('_', ' ')}</span>
                  {job.location && <span>{job.location}</span>}
                  <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/recruiter/candidates/${job.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View candidates">
                  <Users className="w-4 h-4" />
                </Link>
                <Link to={`/jobs/${job.id}`}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Preview">
                  <Eye className="w-4 h-4" />
                </Link>
                <Link to={`/recruiter/jobs/${job.id}/edit`}
                  className="p-2 text-gray-400 hover:text-amber-600 transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </Link>
                {job.status === 'DRAFT' && (
                  <button onClick={() => handlePublish(job.id)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Publish">
                    <Globe className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleDelete(job.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
