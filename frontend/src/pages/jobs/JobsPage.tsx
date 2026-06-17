import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { jobsAPI } from '../../services/api'
import { Search, MapPin, Filter, BookmarkPlus, BookmarkCheck, Clock, DollarSign, Briefcase, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import { formatDistanceToNow } from 'date-fns'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE']
const EXP_LEVELS = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']

export default function JobsPage() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    job_type: '',
    experience_level: '',
    category_id: '',
    is_remote: '',
    page: 1,
  })

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadJobs() }, [filters])

  const loadCategories = async () => {
    try { const { data } = await jobsAPI.getCategories(); setCategories(data) } catch {}
  }

  const loadJobs = async () => {
    setLoading(true)
    try {
      const params: any = { ...filters }
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
      if (params.is_remote) params.is_remote = params.is_remote === 'true'
      const { data } = await jobsAPI.list(params)
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load jobs') }
    finally { setLoading(false) }
  }

  const handleSave = async (jobId: number) => {
    if (!user) { toast.info('Please login to save jobs'); return }
    try {
      const { data } = await jobsAPI.save(jobId)
      setSavedIds(prev => {
        const next = new Set(prev)
        data.saved ? next.add(jobId) : next.delete(jobId)
        return next
      })
      toast.success(data.message)
    } catch { toast.error('Failed to save job') }
  }

  const updateFilter = (key: string, val: string) => {
    setFilters(f => ({ ...f, [key]: val, page: 1 }))
  }

  const clearFilters = () => setFilters({ keyword: '', location: '', job_type: '', experience_level: '', category_id: '', is_remote: '', page: 1 })

  const typeLabel = (t: string) => t.replace('_', ' ')
  const salaryDisplay = (job: any) => {
    if (!job.salary_min && !job.salary_max) return null
    const min = job.salary_min ? `$${(job.salary_min / 1000).toFixed(0)}k` : ''
    const max = job.salary_max ? `$${(job.salary_max / 1000).toFixed(0)}k` : ''
    return min && max ? `${min} - ${max}` : min || max
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
            placeholder="Job title or keyword"
            value={filters.keyword} onChange={e => updateFilter('keyword', e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <input className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
            placeholder="Location"
            value={filters.location} onChange={e => updateFilter('location', e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filters
        </button>
        {(filters.job_type || filters.experience_level || filters.is_remote || filters.category_id) && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 px-2">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Job Type</label>
            <select className="input-field text-sm" value={filters.job_type} onChange={e => updateFilter('job_type', e.target.value)}>
              <option value="">All Types</option>
              {JOB_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Experience</label>
            <select className="input-field text-sm" value={filters.experience_level} onChange={e => updateFilter('experience_level', e.target.value)}>
              <option value="">All Levels</option>
              {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
            <select className="input-field text-sm" value={filters.category_id} onChange={e => updateFilter('category_id', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Remote</label>
            <select className="input-field text-sm" value={filters.is_remote} onChange={e => updateFilter('is_remote', e.target.value)}>
              <option value="">All</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-600 text-sm"><span className="font-semibold text-gray-900">{total.toLocaleString()}</span> jobs found</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
              <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No jobs found</h3>
          <p className="text-gray-400">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job: any) => (
            <div key={job.id} className="card hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {job.is_featured && (
                    <span className="badge bg-amber-100 text-amber-700 mb-1">⭐ Featured</span>
                  )}
                  <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors block">
                    {job.title}
                  </Link>
                </div>
                <button onClick={() => handleSave(job.id)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors ml-2">
                  {savedIds.has(job.id) ? <BookmarkCheck className="w-5 h-5 text-primary-600" /> : <BookmarkPlus className="w-5 h-5" />}
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-3">{job.company?.name || 'Company'}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge bg-blue-100 text-blue-700">{typeLabel(job.job_type)}</span>
                {job.is_remote && <span className="badge bg-green-100 text-green-700">Remote</span>}
                {job.experience_level && <span className="badge bg-purple-100 text-purple-700">{job.experience_level}</span>}
              </div>

              <div className="mt-auto space-y-1.5 text-xs text-gray-400">
                {job.location && (
                  <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</div>
                )}
                {salaryDisplay(job) && (
                  <div className="flex items-center gap-1 text-green-600 font-medium"><DollarSign className="w-3.5 h-3.5" />{salaryDisplay(job)}</div>
                )}
                {job.created_at && (
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</div>
                )}
              </div>

              <Link to={`/jobs/${job.id}`} className="mt-4 btn-primary text-center text-sm py-2">View & Apply</Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-3 mt-8">
          <button disabled={filters.page <= 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            className="btn-secondary text-sm disabled:opacity-40">Previous</button>
          <span className="flex items-center text-sm text-gray-600">Page {filters.page}</span>
          <button disabled={jobs.length < 20}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            className="btn-secondary text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
