import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-toastify'
import { Briefcase, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const defaultRole = params.get('role') || 'JOB_SEEKER'

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirm_password: '', role: defaultRole
  })
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match'); return
    }
    try {
      const { confirm_password, ...payload } = form
      await register(payload)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed')
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Start your journey today</p>
        </div>

        <div className="card">
          {/* Role Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
            {['JOB_SEEKER', 'RECRUITER'].map(r => (
              <button key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${form.role === r ? 'bg-white shadow text-primary-700' : 'text-gray-500'}`}>
                {r === 'JOB_SEEKER' ? '🔍 Job Seeker' : '🏢 Recruiter'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input required className="input-field" placeholder="John"
                  value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input required className="input-field" placeholder="Doe"
                  value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required className="input-field pr-10"
                  placeholder="Min 8 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" required className="input-field" placeholder="••••••••"
                value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
