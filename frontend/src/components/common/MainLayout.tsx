import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Briefcase, Bell, User, LogOut, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'

export default function MainLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const dashboardPath =
    user?.role === 'ADMIN' ? '/admin/dashboard' :
    user?.role === 'RECRUITER' ? '/recruiter/dashboard' :
    '/seeker/dashboard'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">CareerConnect <span className="text-primary-600">Pro</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/jobs" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Find Jobs</Link>
              <Link to="/companies" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Companies</Link>
              {!user && <Link to="/register?role=RECRUITER" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Post a Job</Link>}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link to={dashboardPath} className="btn-secondary text-sm">Dashboard</Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
                    <LogOut className="w-4 h-4" /> <span className="text-sm">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm">Login</Link>
                  <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white py-4 px-4 space-y-3">
            <Link to="/jobs" className="block text-gray-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Find Jobs</Link>
            <Link to="/companies" className="block text-gray-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Companies</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="block btn-primary text-center" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left text-red-600 py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block btn-secondary text-center" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block btn-primary text-center" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">CareerConnect Pro</span>
              </div>
              <p className="text-sm">The modern platform connecting talented professionals with top companies.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link to="/companies" className="hover:text-white transition-colors">Top Companies</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register?role=RECRUITER" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link to="/register?role=RECRUITER" className="hover:text-white transition-colors">Search Resumes</Link></li>
                <li><Link to="/subscriptions" className="hover:text-white transition-colors">Pricing Plans</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            © {new Date().getFullYear()} CareerConnect Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
