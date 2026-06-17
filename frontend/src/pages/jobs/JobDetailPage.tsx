import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { jobsAPI, applicationsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import {
  MapPin, Clock, DollarSign, Briefcase, Users, Globe, BookmarkPlus,
  BookmarkCheck, Share2, ArrowLeft, CheckCircle, Bot
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)

  useEffect(() => { loadJob() }, [id])

  const loadJob = async () => {
    try {
      const { data } = await jobsAPI.get(Number(id))
      setJob(data)
    } catch { toast.error('Job not found'); navigate('/jobs') }
    finally { setLoading(false) }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setApplying(true)
    try {
      await applicationsAPI.apply({ job_id: Number(id), cover_letter: coverLetter })
      setApplied(true)
      setShowApplyForm(false)
      toast.success('Application submitted successfully!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to apply')
    } finally { setApplying(false) }
  }

  const handleSave = async () => {
    if (!user) { toast.info('Please login to save jobs'); return }
    try {
      const { data } = await jobsAPI.save(Number(id))
      setSaved(data.saved)
      toast.success(data.message)
    } catch { toast.error('Failed to save') }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="card animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    </div>
  )

  if (!job) return null

  const salary = job.salary_min || job.salary_max
    ? `$${((job.salary_min || 0) / 1000).toFixed(0)}k – $${((job.salary_max || 0) / 1000).toFixed(0)}k`
    : 'Not specified'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/jobs" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-500 mt-1">{job.company?.name || 'Company'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {saved ? <BookmarkCheck className="w-5 h-5 text-primary-600" /> : <BookmarkPlus className="w-5 h-5 text-gray-500" />}
                </button>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <span className="badge bg-blue-100 text-blue-700 px-3 py-1">{job.job_type?.replace('_', ' ')}</span>
              {job.is_remote && <span className="badge bg-green-100 text-green-700 px-3 py-1">Remote</span>}
              {job.experience_level && <span className="badge bg-purple-100 text-purple-700 px-3 py-1">{job.experience_level}</span>}
              {job.is_featured && <span className="badge bg-amber-100 text-amber-700 px-3 py-1">⭐ Featured</span>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl text-sm">
              {job.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>{salary}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : 'Recently'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</div>
          </div>

          {job.requirements && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">{job.requirements}</div>
            </div>
          )}

          {job.responsibilities && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Responsibilities</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">{job.responsibilities}</div>
            </div>
          )}

          {job.benefits && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Benefits</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">{job.benefits}</div>
            </div>
          )}

          {job.required_skills?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((s: string) => (
                  <span key={s} className="badge bg-primary-100 text-primary-700 px-3 py-1.5 text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card sticky top-6">
            {applied ? (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Application Submitted!</h3>
                <p className="text-sm text-gray-500 mt-1">Good luck with your application</p>
                <Link to="/seeker/applications" className="btn-secondary mt-4 block text-center text-sm">Track Application</Link>
              </div>
            ) : showApplyForm ? (
              <form onSubmit={handleApply}>
                <h3 className="font-semibold text-gray-900 mb-3">Quick Apply</h3>
                <textarea
                  className="input-field mb-3 text-sm resize-none"
                  rows={5}
                  placeholder="Write a brief cover letter (optional)..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
                <button type="submit" disabled={applying} className="btn-primary w-full mb-2">
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
                <button type="button" onClick={() => setShowApplyForm(false)} className="btn-secondary w-full text-sm">Cancel</button>
              </form>
            ) : (
              <>
                {user?.role === 'JOB_SEEKER' || !user ? (
                  <button onClick={() => user ? setShowApplyForm(true) : navigate('/login')}
                    className="btn-primary w-full py-3 text-base mb-3">
                    Apply Now
                  </button>
                ) : null}

                {user?.role === 'JOB_SEEKER' && (
                  <Link to={`/seeker/ai-assistant`}
                    className="flex items-center justify-center gap-2 btn-secondary w-full text-sm">
                    <Bot className="w-4 h-4" /> AI Interview Prep
                  </Link>
                )}
              </>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-500">
              <p><span className="font-medium text-gray-700">Applications:</span> {job.applications_count}</p>
              <p><span className="font-medium text-gray-700">Views:</span> {job.views_count}</p>
              {job.expires_at && (
                <p><span className="font-medium text-gray-700">Expires:</span> {new Date(job.expires_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {job.company && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">About {job.company.name}</h3>
              {job.company.logo && <img src={job.company.logo} alt="" className="w-12 h-12 rounded-lg mb-3 object-cover" />}
              <p className="text-sm text-gray-500 mb-3">{job.company.description || 'A great company to work for.'}</p>
              {job.company.website && (
                <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
                  <Globe className="w-4 h-4" /> Visit Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
