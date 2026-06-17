import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationsAPI, jobsAPI, notificationsAPI, profileAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import {
  Briefcase, ClipboardList, BookmarkCheck, Calendar, Bell, TrendingUp,
  ArrowRight, Bot, User, CheckCircle, Clock, XCircle
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  OFFERED: 'bg-green-100 text-green-700',
  HIRED: 'bg-green-200 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

export default function SeekerDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ applications: 0, saved: 0, interviews: 0, notifications: 0 })
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [recommended, setRecommended] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [appsRes, savedRes, interviewsRes, notifRes, recommendedRes, profileRes] = await Promise.allSettled([
        applicationsAPI.myApplications(),
        jobsAPI.getSaved(),
        applicationsAPI.myInterviews(),
        notificationsAPI.unreadCount(),
        jobsAPI.getRecommended(),
        profileAPI.get(),
      ])

      const apps = appsRes.status === 'fulfilled' ? appsRes.value.data : []
      const saved = savedRes.status === 'fulfilled' ? savedRes.value.data : []
      const interviews = interviewsRes.status === 'fulfilled' ? interviewsRes.value.data : []
      const notifCount = notifRes.status === 'fulfilled' ? notifRes.value.data.count : 0

      setStats({ applications: apps.length, saved: saved.length, interviews: interviews.length, notifications: notifCount })
      setRecentApps(apps.slice(0, 5))
      setRecommended(recommendedRes.status === 'fulfilled' ? recommendedRes.value.data.slice(0, 4) : [])
      setProfile(profileRes.status === 'fulfilled' ? profileRes.value.data : null)
    } finally { setLoading(false) }
  }

  const profileCompletion = () => {
    if (!profile) return 0
    const fields = ['first_name', 'last_name', 'phone', 'bio', 'headline', 'location']
    const filled = fields.filter(f => profile[f]).length
    return Math.round((filled / fields.length) * 100)
  }

  const completion = profileCompletion()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.first_name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your job search</p>
      </div>

      {/* Profile completion */}
      {completion < 100 && (
        <div className="card border-l-4 border-l-primary-500 bg-primary-50 border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-900">Complete your profile</h3>
              <p className="text-sm text-primary-700 mt-0.5">A complete profile gets 5x more views from recruiters</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-primary-200 rounded-full h-2 w-32">
                  <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${completion}%` }} />
                </div>
                <span className="text-sm font-semibold text-primary-700">{completion}%</span>
              </div>
            </div>
            <Link to="/seeker/profile" className="btn-primary text-sm whitespace-nowrap">Complete Profile</Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ClipboardList, label: 'Applications', value: stats.applications, href: '/seeker/applications', color: 'text-blue-600 bg-blue-50' },
          { icon: BookmarkCheck, label: 'Saved Jobs', value: stats.saved, href: '/seeker/saved-jobs', color: 'text-purple-600 bg-purple-50' },
          { icon: Calendar, label: 'Interviews', value: stats.interviews, href: '/seeker/interviews', color: 'text-green-600 bg-green-50' },
          { icon: Bell, label: 'Notifications', value: stats.notifications, href: '/seeker/notifications', color: 'text-amber-600 bg-amber-50' },
        ].map(({ icon: Icon, label, value, href, color }) => (
          <Link key={label} to={href} className="card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Applications</h2>
            <Link to="/seeker/applications" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No applications yet</p>
              <Link to="/jobs" className="text-primary-600 text-sm hover:underline mt-1 block">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Job #{app.job_id}</p>
                    <p className="text-xs text-gray-400">{new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'} ml-2 whitespace-nowrap`}>
                    {app.status?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recommended for You</h2>
            <Link to="/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recommended.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Add skills to get recommendations</p>
              <Link to="/seeker/profile" className="text-primary-600 text-sm hover:underline mt-1 block">Add Skills</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recommended.map((job: any) => (
                <Link key={job.id} to={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 truncate">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.location || 'Remote'}</p>
                  </div>
                  <span className="badge bg-blue-100 text-blue-700 ml-2 whitespace-nowrap">{job.job_type?.replace('_', ' ')}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5" />
            <h3 className="font-bold text-lg">AI Career Assistant</h3>
          </div>
          <p className="text-primary-100 text-sm">Get personalized resume tips, interview prep, and career guidance powered by AI.</p>
        </div>
        <Link to="/seeker/ai-assistant" className="flex-shrink-0 bg-white text-primary-700 font-semibold px-5 py-2 rounded-xl hover:bg-primary-50 transition-colors text-sm ml-4">
          Try Now
        </Link>
      </div>
    </div>
  )
}
