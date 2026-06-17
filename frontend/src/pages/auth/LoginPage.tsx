import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-toastify'
import { Briefcase, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      const user = useAuthStore.getState().user
      if (user?.role === 'ADMIN') navigate('/admin/dashboard')
      else if (user?.role === 'RECRUITER') navigate('/recruiter/dashboard')
      else navigate('/seeker/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">CareerConnect Pro</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Create one</Link>
          </p>

          {/* Demo credentials */}
          {/* <div className="mt-5 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Demo Accounts:</p>
            <p>Admin: admin@demo.com / admin123</p>
            <p>Recruiter: recruiter@demo.com / recruiter123</p>
            <p>Seeker: seeker@demo.com / seeker123</p>
          </div> */}
        </div>
      </div>
    </div>
  )
}
