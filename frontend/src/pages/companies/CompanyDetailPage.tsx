import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { companiesAPI, jobsAPI, reviewsAPI } from '../../services/api'
import { Building2, Globe, Users, MapPin, Linkedin, Briefcase, Star, ArrowLeft, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [company, setCompany] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [rating, setRating] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '', pros: '', cons: '', is_anonymous: false })

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [compRes, jobsRes, reviewsRes, ratingRes] = await Promise.allSettled([
        companiesAPI.get(Number(id)),
        jobsAPI.list({ page_size: 10 }),
        reviewsAPI.getCompanyReviews(Number(id)),
        reviewsAPI.getCompanyRating(Number(id)),
      ])
      if (compRes.status === 'fulfilled') setCompany(compRes.value.data)
      if (jobsRes.status === 'fulfilled') setJobs((jobsRes.value.data.jobs || []).filter((j: any) => j.company_id === Number(id)))
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data)
      if (ratingRes.status === 'fulfilled') setRating(ratingRes.value.data)
    } finally { setLoading(false) }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await reviewsAPI.create({ company_id: Number(id), ...reviewForm })
      toast.success('Review submitted!')
      setShowReviewForm(false)
      loadData()
    } catch { toast.error('Failed to submit review') }
  }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-10"><div className="card animate-pulse h-48" /></div>
  if (!company) return <div className="text-center py-20 text-gray-400">Company not found</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/companies" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-5">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-2xl object-cover border border-gray-100" />
          ) : (
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center">
              <Building2 className="w-10 h-10 text-primary-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              {company.is_verified && <span className="badge bg-green-100 text-green-700">✓ Verified</span>}
            </div>
            <p className="text-gray-500 mt-1">{company.industry}</p>

            {rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating.average_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{rating.average_rating}</span>
                <span className="text-sm text-gray-400">({rating.total_reviews} reviews)</span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {company.company_size && (
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{company.company_size} employees</span>
              )}
              {company.headquarters && (
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{company.headquarters}</span>
              )}
              {company.founded_year && <span>Founded {company.founded_year}</span>}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:underline">
                  <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {company.linkedin_url && (
                <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:underline">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {company.description && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed">{company.description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Jobs */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-500" /> Open Positions ({jobs.length})
            </h2>
            {jobs.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No open positions right now</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job: any) => (
                  <Link key={job.id} to={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors group">
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-primary-700">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.location || 'Remote'} · {job.job_type?.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs font-medium text-primary-600">Apply →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Employee Reviews
              </h2>
              {user && (
                <button onClick={() => setShowReviewForm(true)} className="btn-primary text-sm py-1.5">Write Review</button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={submitReview} className="mb-5 p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Rating:</span>
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i })}>
                      <Star className={`w-6 h-6 ${i <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <input className="input-field text-sm" placeholder="Review title"
                  value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} />
                <textarea className="input-field text-sm resize-none" rows={3} placeholder="Overall review..."
                  value={reviewForm.content} onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <textarea className="input-field text-sm resize-none" rows={2} placeholder="Pros..."
                    value={reviewForm.pros} onChange={e => setReviewForm({ ...reviewForm, pros: e.target.value })} />
                  <textarea className="input-field text-sm resize-none" rows={2} placeholder="Cons..."
                    value={reviewForm.cons} onChange={e => setReviewForm({ ...reviewForm, cons: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={reviewForm.is_anonymous}
                      onChange={e => setReviewForm({ ...reviewForm, is_anonymous: e.target.checked })} />
                    Post anonymously
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-sm py-1.5 px-4">Submit</button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
                  </div>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                      </div>
                      <span className="font-semibold text-sm text-gray-800">{r.title}</span>
                      {r.is_anonymous && <span className="text-xs text-gray-400">Anonymous</span>}
                    </div>
                    {r.content && <p className="text-sm text-gray-600 mt-1">{r.content}</p>}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {r.pros && <div className="text-xs text-green-700 bg-green-50 p-2 rounded">👍 {r.pros}</div>}
                      {r.cons && <div className="text-xs text-red-700 bg-red-50 p-2 rounded">👎 {r.cons}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Company Details</h3>
            <dl className="space-y-2 text-sm">
              {[
                { label: 'Industry', value: company.industry },
                { label: 'Size', value: company.company_size ? `${company.company_size} employees` : null },
                { label: 'Founded', value: company.founded_year },
                { label: 'HQ', value: company.headquarters },
              ].filter(d => d.value).map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
