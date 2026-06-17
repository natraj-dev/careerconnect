import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, TrendingUp, Shield, Zap, Users, Building2, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { name: 'Technology', icon: '💻', count: '2,340+' },
  { name: 'Marketing', icon: '📈', count: '1,230+' },
  { name: 'Finance', icon: '💰', count: '890+' },
  { name: 'Healthcare', icon: '🏥', count: '1,100+' },
  { name: 'Design', icon: '🎨', count: '760+' },
  { name: 'Sales', icon: '🤝', count: '980+' },
  { name: 'Engineering', icon: '⚙️', count: '1,560+' },
  { name: 'Education', icon: '📚', count: '430+' },
]

const FEATURED_JOBS = [
  { title: 'Senior React Developer', company: 'TechCorp Inc.', location: 'San Francisco, CA', type: 'Full-time', salary: '$120k - $160k', logo: '🏢' },
  { title: 'Product Manager', company: 'StartupXYZ', location: 'Remote', type: 'Full-time', salary: '$100k - $130k', logo: '🚀' },
  { title: 'Data Scientist', company: 'Analytics Pro', location: 'New York, NY', type: 'Full-time', salary: '$130k - $170k', logo: '📊' },
  { title: 'UX Designer', company: 'DesignHub', location: 'Austin, TX', type: 'Contract', salary: '$80k - $110k', logo: '🎨' },
  { title: 'DevOps Engineer', company: 'CloudBase', location: 'Remote', type: 'Full-time', salary: '$115k - $145k', logo: '☁️' },
  { title: 'Marketing Manager', company: 'BrandCo', location: 'Chicago, IL', type: 'Full-time', salary: '$90k - $120k', logo: '📣' },
]

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <TrendingUp className="w-4 h-4" /> <span>10,000+ jobs posted this month</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Find Your <span className="text-yellow-300">Dream Job</span><br />& Grow Your Career
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Connect with top companies, showcase your skills, and land the role you've always wanted — all in one platform.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Job title, keyword, or company"
                value={keyword} onChange={e => setKeyword(e.target.value)} />
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-gray-200" />
            <div className="flex items-center gap-2 flex-1 px-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
                placeholder="City, state, or remote"
                value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors whitespace-nowrap">
              Search Jobs
            </button>
          </form>

          <p className="mt-4 text-primary-200 text-sm">Popular: React Developer, Product Manager, Data Scientist, UX Designer</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Active Jobs', value: '50K+', icon: Briefcase },
            { label: 'Companies', value: '8K+', icon: Building2 },
            { label: 'Job Seekers', value: '200K+', icon: Users },
            { label: 'Hires Made', value: '35K+', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              <span className="text-sm text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-2">Discover thousands of jobs across all industries</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ name, icon, count }) => (
              <Link key={name} to={`/jobs?keyword=${name}`}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{name}</h3>
                <p className="text-xs text-gray-400 mt-1">{count} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
              <p className="text-gray-500 mt-1">Hand-picked opportunities from top companies</p>
            </div>
            <Link to="/jobs" className="hidden md:flex items-center gap-1 text-primary-600 font-medium hover:underline">
              View all jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_JOBS.map((job) => (
              <Link key={job.title} to="/jobs"
                className="border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-primary-200 transition-all group bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{job.logo}</div>
                  <span className={`badge ${job.type === 'Remote' || job.location === 'Remote' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {job.type}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{job.company}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="text-green-600 font-medium">{job.salary}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/jobs" className="btn-primary px-8 py-3 text-base">Browse All Jobs</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose CareerConnect Pro?</h2>
            <p className="text-gray-500 mt-2">Everything you need to succeed in your job search</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'AI-Powered Matching', desc: 'Get personalized job recommendations based on your skills, experience, and preferences.', color: 'text-yellow-500 bg-yellow-50' },
              { icon: Shield, title: 'Verified Companies', desc: 'Every company on our platform is verified. Apply with confidence to legitimate opportunities.', color: 'text-green-500 bg-green-50' },
              { icon: TrendingUp, title: 'Career Growth Tools', desc: 'Resume builder, interview prep, and AI career assistant to help you level up.', color: 'text-purple-500 bg-purple-50' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to take the next step?</h2>
        <p className="text-primary-200 text-lg mb-8">Join 200,000+ professionals already using CareerConnect Pro</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Create Free Account
          </Link>
          <Link to="/register?role=RECRUITER" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
            Post a Job
          </Link>
        </div>
      </section>
    </div>
  )
}
