import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobsAPI, applicationsAPI, companiesAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Briefcase, Users, PlusCircle, TrendingUp, Eye, ClipboardList, Building2, ArrowRight } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  OFFERED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function RecruiterDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ jobs: 0, applications: 0, views: 0, shortlisted: 0 })
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [recruiter, setRecruiter] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [jobsRes, recruiterRes] = await Promise.allSettled([
        jobsAPI.list({ page_size: 100 }),
        companiesAPI.getMyRecruiterProfile(),
      ])

      if (jobsRes.status === 'fulfilled') {
        const allJobs = jobsRes.value.data.jobs || []
        const totalViews = allJobs.reduce((sum: number, j: any) => sum + (j.views_count || 0), 0)
        const totalApps = allJobs.reduce((sum: number, j: any) => sum + (j.applications_count || 0), 0)
        setMyJobs(allJobs.slice(0, 5))
        setStats({ jobs: allJobs.length, applications: totalApps, views: totalViews, shortlisted: 0 })
      }
      if (recruiterRes.status === 'fulfilled') setRecruiter(recruiterRes.value.data)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your job postings and candidates</p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {/* Company setup prompt */}
      {!recruiter && (
        <div className="card border-l-4 border-l-amber-500 bg-amber-50 border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-900">Set up your recruiter profile</p>
              <p className="text-sm text-amber-700 mt-0.5">Create your company and recruiter profile to start posting jobs</p>
            </div>
            <Link to="/recruiter/company" className="btn-primary text-sm bg-amber-600 hover:bg-amber-700">Setup Now</Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: 'Active Jobs', value: stats.jobs, href: '/recruiter/jobs', color: 'text-blue-600 bg-blue-50' },
          { icon: ClipboardList, label: 'Total Applications', value: stats.applications, href: '/recruiter/jobs', color: 'text-green-600 bg-green-50' },
          { icon: Eye, label: 'Total Views', value: stats.views, href: '/recruiter/jobs', color: 'text-purple-600 bg-purple-50' },
          { icon: TrendingUp, label: 'Shortlisted', value: stats.shortlisted, href: '/recruiter/jobs', color: 'text-amber-600 bg-amber-50' },
        ].map(({ icon: Icon, label, value, href, color }) => (
          <Link key={label} to={href} className="card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Job Postings</h2>
            <Link to="/recruiter/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {myJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No jobs posted yet</p>
              <Link to="/recruiter/jobs/create" className="text-primary-600 text-sm hover:underline mt-1 block">Post your first job</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="min-w-0">
                    <Link to={`/recruiter/candidates/${job.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block">{job.title}</Link>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{job.applications_count} applicants</span>
                      <span className="text-xs text-gray-400">{job.views_count} views</span>
                    </div>
                  </div>
                  <span className={`badge ml-2 whitespace-nowrap ${job.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: PlusCircle, label: 'Post New Job', href: '/recruiter/jobs/create', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { icon: Users, label: 'View Candidates', href: '/recruiter/jobs', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { icon: Building2, label: 'Company Profile', href: '/recruiter/company', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { icon: TrendingUp, label: 'Subscription', href: '/recruiter/subscription', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
            ].map(({ icon: Icon, label, href, color }) => (
              <Link key={label} to={href} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${color}`}>
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
