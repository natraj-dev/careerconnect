// SavedJobsPage.tsx
import { useState, useEffect } from 'react'
import { jobsAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BookmarkCheck, MapPin, Trash2 } from 'lucide-react'

export function SavedJobsPage() {
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsAPI.getSaved().then(r => setSaved(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [])

  const unsave = async (jobId: number) => {
    try {
      await jobsAPI.save(jobId)
      setSaved(prev => prev.filter(s => s.job_id !== jobId))
      toast.success('Job removed from saved')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 mt-1">{saved.length} job{saved.length !== 1 ? 's' : ''} saved</p>
      </div>
      {loading ? <div className="card animate-pulse h-32" /> :
        saved.length === 0 ? (
          <div className="card text-center py-16">
            <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No saved jobs</h3>
            <Link to="/jobs" className="btn-primary mt-4 inline-block">Browse Jobs</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((s: any) => (
              <div key={s.id} className="card flex items-center justify-between">
                <div>
                  <Link to={`/jobs/${s.job_id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                    Job #{s.job_id}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">Saved on {new Date(s.saved_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/jobs/${s.job_id}`} className="btn-primary text-sm py-1.5">Apply</Link>
                  <button onClick={() => unsave(s.job_id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

export default SavedJobsPage
