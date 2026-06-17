import { useState, useEffect } from 'react'
import { companiesAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Building2, Save, Upload, Globe, Linkedin, Users } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function CompanyProfilePage() {
  const { user } = useAuthStore()
  const [company, setCompany] = useState<any>(null)
  const [recruiter, setRecruiter] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [recForm, setRecForm] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const recRes = await companiesAPI.getMyRecruiterProfile().catch(() => null)
      if (recRes) {
        setRecruiter(recRes.data)
        setRecForm({ designation: recRes.data.designation || '', department: recRes.data.department || '' })
        if (recRes.data.company_id) {
          const compRes = await companiesAPI.get(recRes.data.company_id).catch(() => null)
          if (compRes) { setCompany(compRes.data); setForm(compRes.data) }
        }
      }
    } finally { setLoading(false) }
  }

  const saveCompany = async () => {
    setSaving(true)
    try {
      if (company) {
        const { data } = await companiesAPI.update(company.id, form)
        setCompany(data); setForm(data)
      } else {
        const { data } = await companiesAPI.create(form)
        setCompany(data); setForm(data)
        // Link recruiter to company
        if (recruiter) {
          await companiesAPI.updateRecruiterProfile({ company_id: data.id, ...recForm })
        }
      }
      setEditing(false)
      toast.success('Company saved!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save')
    } finally { setSaving(false) }
  }

  const saveRecruiter = async () => {
    setSaving(true)
    try {
      if (recruiter) {
        await companiesAPI.updateRecruiterProfile(recForm)
        toast.success('Profile updated!')
      } else {
        await companiesAPI.createRecruiterProfile(recForm)
        toast.success('Recruiter profile created!')
        loadData()
      }
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !company) return
    try {
      const { data } = await companiesAPI.uploadLogo(company.id, file)
      setCompany((prev: any) => ({ ...prev, logo: data.logo }))
      toast.success('Logo uploaded!')
    } catch { toast.error('Failed to upload logo') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-500 mt-1">Manage your company and recruiter profile</p>
      </div>

      {/* Recruiter Profile */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-primary-500" />Recruiter Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input className="input-field" placeholder="e.g. HR Manager"
              value={recForm.designation || ''} onChange={e => setRecForm({ ...recForm, designation: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input className="input-field" placeholder="e.g. Human Resources"
              value={recForm.department || ''} onChange={e => setRecForm({ ...recForm, department: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveRecruiter} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : recruiter ? 'Update Profile' : 'Create Profile'}
          </button>
          {recruiter?.is_verified && <span className="badge bg-green-100 text-green-700">✓ Verified</span>}
        </div>
      </div>

      {/* Company Profile */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary-500" />Company Information</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveCompany} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setEditing(false); setForm(company || {}) }} className="btn-secondary text-sm">Cancel</button>
            </div>
          )}
        </div>

        {/* Logo */}
        {company && (
          <div className="flex items-center gap-4">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center"><Building2 className="w-8 h-8 text-gray-400" /></div>
            )}
            <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Logo
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
            {company.is_verified && <span className="badge bg-green-100 text-green-700">✓ Verified</span>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Company Name', placeholder: 'Acme Corp', required: true },
            { key: 'industry', label: 'Industry', placeholder: 'Technology' },
            { key: 'headquarters', label: 'Headquarters', placeholder: 'San Francisco, CA' },
            { key: 'website', label: 'Website', placeholder: 'https://acme.com' },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
              {editing ? (
                <input className="input-field" placeholder={placeholder}
                  value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              ) : (
                <p className="text-sm text-gray-800">{company?.[key] || <span className="text-gray-400">Not set</span>}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            {editing ? (
              <select className="input-field" value={form.company_size || ''} onChange={e => setForm({ ...form, company_size: e.target.value })}>
                <option value="">Select size</option>
                {['1-10', '11-50', '51-200', '201-1000', '1000+'].map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            ) : (
              <p className="text-sm text-gray-800">{company?.company_size ? `${company.company_size} employees` : <span className="text-gray-400">Not set</span>}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
            {editing ? (
              <input type="number" className="input-field" placeholder="2010"
                value={form.founded_year || ''} onChange={e => setForm({ ...form, founded_year: e.target.value })} />
            ) : (
              <p className="text-sm text-gray-800">{company?.founded_year || <span className="text-gray-400">Not set</span>}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">About Company</label>
          {editing ? (
            <textarea className="input-field resize-none" rows={5} placeholder="Describe your company, culture, and mission..."
              value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          ) : (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{company?.description || <span className="text-gray-400">No description</span>}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          {editing ? (
            <input className="input-field" placeholder="https://linkedin.com/company/..."
              value={form.linkedin_url || ''} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} />
          ) : (
            company?.linkedin_url
              ? <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">{company.linkedin_url}</a>
              : <span className="text-sm text-gray-400">Not set</span>
          )}
        </div>

        {!company && !editing && (
          <button onClick={() => setEditing(true)} className="btn-primary">Create Company Profile</button>
        )}
      </div>
    </div>
  )
}
