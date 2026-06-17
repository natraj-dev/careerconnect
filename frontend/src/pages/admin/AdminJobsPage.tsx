import { useState, useEffect } from 'react'
import { adminAPI, jobsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Briefcase, Star, StarOff, Search } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-gray-100 text-gray-600',
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    try {
      const { data } = await jobsAPI.list({ page_size: 50 })
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const toggleFeatured = async (id: number) => {
    try {
      await adminAPI.toggleFeaturedJob(id)
      setJobs(prev => prev.map(j => j.id === id ? { ...j, is_featured: !j.is_featured } : j))
      toast.success('Updated')
    } catch { toast.error('Failed') }
  }

  const filtered = search ? jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase())) : jobs

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
        <p className="text-gray-500 mt-1">{total.toLocaleString()} total jobs</p>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="flex-1 outline-none text-sm placeholder-gray-400" placeholder="Search jobs..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Job Title', 'Type', 'Status', 'Applications', 'Views', 'Featured', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((job: any) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.location || 'Remote'}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{job.job_type?.replace('_', ' ')}</td>
                <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[job.status]}`}>{job.status}</span></td>
                <td className="px-4 py-3 text-gray-600">{job.applications_count}</td>
                <td className="px-4 py-3 text-gray-600">{job.views_count}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${job.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {job.is_featured ? '⭐ Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured(job.id)}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors text-amber-600 hover:bg-amber-50">
                    {job.is_featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                    {job.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2" />
            <p>No jobs found</p>
          </div>
        )}
      </div>
    </div>
  )
}
