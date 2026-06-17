import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jobsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE']
const EXP_LEVELS = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']

export default function CreateJobPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', responsibilities: '',
    benefits: '', job_type: 'FULL_TIME', experience_level: 'MID',
    location: '', city: '', country: '', is_remote: false,
    salary_min: '', salary_max: '', salary_currency: 'USD',
    required_skills: [] as string[], openings: 1, category_id: '',
    status: 'DRAFT',
  })

  useEffect(() => {
    jobsAPI.getCategories().then(r => setCategories(r.data)).catch(() => {})
    if (isEdit) {
      jobsAPI.get(Number(id)).then(r => {
        const j = r.data
        setForm({
          title: j.title || '', description: j.description || '',
          requirements: j.requirements || '', responsibilities: j.responsibilities || '',
          benefits: j.benefits || '', job_type: j.job_type || 'FULL_TIME',
          experience_level: j.experience_level || 'MID',
          location: j.location || '', city: j.city || '', country: j.country || '',
          is_remote: j.is_remote || false, salary_min: j.salary_min || '',
          salary_max: j.salary_max || '', salary_currency: j.salary_currency || 'USD',
          required_skills: j.required_skills || [], openings: j.openings || 1,
          category_id: j.category_id || '', status: j.status || 'DRAFT',
        })
      }).catch(() => toast.error('Failed to load job'))
    }
  }, [id])

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.required_skills.includes(s)) {
      setForm(f => ({ ...f, required_skills: [...f.required_skills, s] }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => setForm(f => ({ ...f, required_skills: f.required_skills.filter(s => s !== skill) }))

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setSaving(true)
    const payload: any = {
      ...form,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      category_id: form.category_id ? Number(form.category_id) : null,
    }
    if (publish) payload.status = 'PUBLISHED'
    try {
      if (isEdit) {
        await jobsAPI.update(Number(id), payload)
        if (publish) await jobsAPI.publish(Number(id))
        toast.success('Job updated!')
      } else {
        const { data } = await jobsAPI.create(payload)
        if (publish) await jobsAPI.publish(data.id)
        toast.success(publish ? 'Job published!' : 'Job saved as draft!')
      }
      navigate('/recruiter/jobs')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save job')
    } finally { setSaving(false) }
  }

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/recruiter/jobs')} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
          <p className="text-gray-500 mt-0.5">Fill in the details for your job posting</p>
        </div>
      </div>

      <form onSubmit={e => handleSubmit(e)} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input required className="input-field" placeholder="e.g. Senior React Developer"
              value={form.title} onChange={e => f('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select required className="input-field" value={form.job_type} onChange={e => f('job_type', e.target.value)}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select className="input-field" value={form.experience_level} onChange={e => f('experience_level', e.target.value)}>
                {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={form.category_id} onChange={e => f('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Openings</label>
              <input type="number" min={1} className="input-field"
                value={form.openings} onChange={e => f('openings', Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Location</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input className="input-field" placeholder="San Francisco, CA"
                value={form.location} onChange={e => f('location', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input className="input-field" value={form.city} onChange={e => f('city', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input className="input-field" value={form.country} onChange={e => f('country', e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_remote} onChange={e => f('is_remote', e.target.checked)} />
            This is a remote position
          </label>
        </div>

        {/* Salary */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Compensation</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input type="number" className="input-field" placeholder="e.g. 80000"
                value={form.salary_min} onChange={e => f('salary_min', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input type="number" className="input-field" placeholder="e.g. 120000"
                value={form.salary_max} onChange={e => f('salary_max', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="input-field" value={form.salary_currency} onChange={e => f('salary_currency', e.target.value)}>
                {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Job Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea required className="input-field resize-none" rows={6}
              placeholder="Describe the role, team, and what the candidate will be working on..."
              value={form.description} onChange={e => f('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea className="input-field resize-none" rows={5}
              placeholder="List the required qualifications and experience..."
              value={form.requirements} onChange={e => f('requirements', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
            <textarea className="input-field resize-none" rows={5}
              placeholder="List the key responsibilities of the role..."
              value={form.responsibilities} onChange={e => f('responsibilities', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
            <textarea className="input-field resize-none" rows={4}
              placeholder="Health insurance, remote work, equity, etc."
              value={form.benefits} onChange={e => f('benefits', e.target.value)} />
          </div>
        </div>

        {/* Skills */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Required Skills</h2>
          <div className="flex gap-2">
            <input className="input-field flex-1" placeholder="e.g. React, TypeScript, Node.js"
              value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button type="button" onClick={addSkill} className="btn-secondary flex items-center gap-1 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {form.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.required_skills.map(skill => (
                <span key={skill} className="flex items-center gap-1.5 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button type="submit" disabled={saving} className="btn-secondary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button type="button" disabled={saving} onClick={e => handleSubmit(e as any, true)}
            className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
