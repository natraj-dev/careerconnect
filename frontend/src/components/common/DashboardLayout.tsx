import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  Briefcase, LayoutDashboard, User, FileText, BookmarkCheck, Calendar,
  MessageSquare, Bell, Bot, CreditCard, LogOut, ChevronLeft, Menu,
  Building2, Users, PlusCircle, BarChart2, Shield, ClipboardList, Settings
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Props { role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN' }

const seekerNav = [
  { to: '/seeker/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/seeker/profile', icon: User, label: 'My Profile' },
  { to: '/seeker/resume', icon: FileText, label: 'Resumes' },
  { to: '/seeker/applications', icon: ClipboardList, label: 'Applications' },
  { to: '/seeker/interviews', icon: Calendar, label: 'Interviews' },
  { to: '/seeker/saved-jobs', icon: BookmarkCheck, label: 'Saved Jobs' },
  { to: '/seeker/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/seeker/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/seeker/notifications', icon: Bell, label: 'Notifications' },
  { to: '/seeker/subscription', icon: CreditCard, label: 'Subscription' },
]

const recruiterNav = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiter/jobs', icon: Briefcase, label: 'My Jobs' },
  { to: '/recruiter/jobs/create', icon: PlusCircle, label: 'Post a Job' },
  { to: '/recruiter/company', icon: Building2, label: 'Company Profile' },
  { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/recruiter/notifications', icon: Bell, label: 'Notifications' },
  { to: '/recruiter/subscription', icon: CreditCard, label: 'Subscription' },
]

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
]

export default function DashboardLayout({ role }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = role === 'ADMIN' ? adminNav : role === 'RECRUITER' ? recruiterNav : seekerNav
  const handleLogout = () => { logout(); navigate('/') }

  const Sidebar = () => (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">CareerConnect</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 ml-auto">
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to.endsWith('dashboard')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-gray-100">
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ')}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 w-full text-sm font-medium transition-colors">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">CareerConnect Pro</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
