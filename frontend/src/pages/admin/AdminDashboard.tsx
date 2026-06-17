import { useState, useEffect } from 'react'
import { adminAPI, subscriptionsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Users, Building2, Briefcase, TrendingUp, DollarSign, Shield, Activity, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const { data } = await adminAPI.dashboard()
      setStats(data)
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  const seedPlans = async () => {
    try {
      await subscriptionsAPI.seedPlans()
      toast.success('Plans seeded successfully!')
    } catch { toast.error('Failed to seed plans') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-600 bg-blue-50', href: '/admin/users' },
    { label: 'Job Seekers', value: stats?.total_job_seekers || 0, icon: Users, color: 'text-purple-600 bg-purple-50', href: '/admin/users' },
    { label: 'Recruiters', value: stats?.total_recruiters || 0, icon: Users, color: 'text-indigo-600 bg-indigo-50', href: '/admin/users' },
    { label: 'Companies', value: stats?.total_companies || 0, icon: Building2, color: 'text-green-600 bg-green-50', href: '/admin/companies' },
    { label: 'Total Jobs', value: stats?.total_jobs || 0, icon: Briefcase, color: 'text-amber-600 bg-amber-50', href: '/admin/jobs' },
    { label: 'Published Jobs', value: stats?.published_jobs || 0, icon: Activity, color: 'text-teal-600 bg-teal-50', href: '/admin/jobs' },
    { label: 'Applications', value: stats?.total_applications || 0, icon: TrendingUp, color: 'text-orange-600 bg-orange-50', href: '/admin/analytics' },
    { label: 'Total Revenue', value: `$${(stats?.total_revenue || 0).toFixed(0)}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50', href: '/admin/analytics' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform overview and management</p>
        </div>
        <button onClick={seedPlans} className="btn-secondary text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Seed Plans
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} to={href} className="card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-primary-500" />Verification Queue</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span>Unverified Companies</span>
              <span className="font-semibold text-amber-600">{(stats?.total_companies || 0) - (stats?.verified_companies || 0)}</span>
            </div>
            <Link to="/admin/companies" className="block text-center btn-secondary text-sm mt-2">Review Companies</Link>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-green-500" />Platform Health</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Jobs Rate</span>
              <span className="font-semibold text-green-600">
                {stats?.total_jobs ? Math.round((stats.published_jobs / stats.total_jobs) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats?.total_jobs ? Math.round((stats.published_jobs / stats.total_jobs) * 100) : 0}%` }} />
            </div>
            <Link to="/admin/analytics" className="block text-center btn-secondary text-sm mt-2">View Analytics</Link>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-500" />Quick Links</h3>
          <div className="space-y-2">
            {[
              { label: '👥 Manage Users', href: '/admin/users' },
              { label: '🏢 Manage Companies', href: '/admin/companies' },
              { label: '💼 Manage Jobs', href: '/admin/jobs' },
              { label: '📊 Analytics', href: '/admin/analytics' },
              { label: '🔍 Audit Logs', href: '/admin/audit-logs' },
            ].map(({ label, href }) => (
              <Link key={href} to={href} className="block text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
