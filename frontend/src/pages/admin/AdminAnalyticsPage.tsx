import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { BarChart2, TrendingUp, Users, Briefcase } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.analytics()
      .then(r => setAnalytics(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  const userGrowth = analytics?.user_growth || []
  const appStats = analytics?.application_stats || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Platform performance overview</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: appStats.total || 0, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
          { label: 'This Month', value: appStats.this_month || 0, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'User Growth', value: `+${userGrowth.reduce((s: number, m: any) => s + m.users, 0)}`, icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: 'Avg/Month', value: Math.round(userGrowth.reduce((s: number, m: any) => s + m.users, 0) / Math.max(userGrowth.length, 1)), icon: BarChart2, color: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
            <div className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* User growth chart */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-5">User Growth (Last 6 Months)</h2>
        {userGrowth.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>

      {/* Application stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-5">Application Trend</h2>
          <div className="h-48 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-primary-600">{appStats.total || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Total Applications</p>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{appStats.this_month || 0}</p>
                <p className="text-xs text-gray-400">This Month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {appStats.total > 0 ? Math.round(((appStats.this_month || 0) / appStats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-400">Monthly Share</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-5">Platform Summary</h2>
          <div className="space-y-4">
            {[
              { label: 'Applications per Month', value: appStats.this_month || 0, max: appStats.total || 1, color: 'bg-blue-500' },
              { label: 'User Registrations (Last 6mo)', value: userGrowth.reduce((s: number, m: any) => s + m.users, 0), max: 1000, color: 'bg-purple-500' },
            ].map(({ label, value, max, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
