import { useState, useEffect } from 'react'
import { profileAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { User, Plus, Trash2, Edit2, Save, X, GraduationCap, Briefcase, Star } from 'lucide-react'

type Tab = 'info' | 'skills' | 'education' | 'experience'

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('info')
  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])
  const [experience, setExperience] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<any>({})
  const [addingSkill, setAddingSkill] = useState(false)
  const [skillForm, setSkillForm] = useState({ name: '', proficiency: 'Intermediate', years_of_experience: 0 })
  const [addingEdu, setAddingEdu] = useState(false)
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', is_current: false, grade: '' })
  const [addingExp, setAddingExp] = useState(false)
  const [expForm, setExpForm] = useState({ company_name: '', job_title: '', employment_type: 'FULL_TIME', location: '', start_date: '', end_date: '', is_current: false, description: '' })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const [p, s, e, ex] = await Promise.allSettled([
        profileAPI.get(), profileAPI.getSkills(), profileAPI.getEducation(), profileAPI.getExperience()
      ])
      if (p.status === 'fulfilled') { setProfile(p.value.data); setProfileForm(p.value.data) }
      if (s.status === 'fulfilled') setSkills(s.value.data)
      if (e.status === 'fulfilled') setEducation(e.value.data)
      if (ex.status === 'fulfilled') setExperience(ex.value.data)
    } finally { setLoading(false) }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      if (profile) {
        const { data } = await profileAPI.update(profileForm)
        setProfile(data); setProfileForm(data)
      } else {
        const { data } = await profileAPI.create(profileForm)
        setProfile(data); setProfileForm(data)
      }
      setEditingProfile(false)
      toast.success('Profile saved!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save')
    } finally { setSaving(false) }
  }

  const addSkill = async () => {
    try {
      const { data } = await profileAPI.addSkill(skillForm)
      setSkills(prev => [...prev, data])
      setSkillForm({ name: '', proficiency: 'Intermediate', years_of_experience: 0 })
      setAddingSkill(false)
      toast.success('Skill added!')
    } catch { toast.error('Failed to add skill') }
  }

  const deleteSkill = async (id: number) => {
    try { await profileAPI.deleteSkill(id); setSkills(prev => prev.filter(s => s.id !== id)); toast.success('Skill removed') }
    catch { toast.error('Failed to remove skill') }
  }

  const addEducation = async () => {
    try {
      const payload = {
        ...eduForm,
        end_date: eduForm.is_current
          ? null
          : (eduForm.end_date || null)
      }

      const { data } = await profileAPI.addEducation(payload)
      setEducation(prev => [...prev, data])
      setAddingEdu(false)
      setEduForm({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', is_current: false, grade: '' })
      toast.success('Education added!')
    } catch { toast.error('Failed to add education') }
  }

  const addExperience = async () => {
    try {
      const payload = {
        ...expForm,
        end_date: expForm.is_current
          ? null
          : (expForm.end_date || null)
      }

      const { data } = await profileAPI.addExperience(payload)

      setExperience(prev => [...prev, data])

      setAddingExp(false)

      setExpForm({
        company_name: '',
        job_title: '',
        employment_type: 'FULL_TIME',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: ''
      })

      toast.success('Experience added!')
    } catch (err: any) {
      console.error(err)
      toast.error(
        err?.response?.data?.detail?.[0]?.msg ||
        'Failed to add experience'
      )
    }
  }

  const TABS = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
  ] as const

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your professional profile</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as Tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {tab === 'info' && (
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
            {!editingProfile ? (
              <button onClick={() => setEditingProfile(true)} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1">
                  <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingProfile(false); setProfileForm(profile) }} className="btn-secondary text-sm py-1.5 px-3">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'first_name', label: 'First Name' },
              { key: 'last_name', label: 'Last Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'location', label: 'Location' },
              { key: 'city', label: 'City' },
              { key: 'country', label: 'Country' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                {editingProfile ? (
                  <input className="input-field text-sm" value={profileForm[key] || ''}
                    onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })} />
                ) : (
                  <p className="text-sm text-gray-900">{profile?.[key] || <span className="text-gray-400">Not set</span>}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Professional Headline</label>
            {editingProfile ? (
              <input className="input-field text-sm" placeholder="e.g. Senior React Developer" value={profileForm.headline || ''}
                onChange={e => setProfileForm({ ...profileForm, headline: e.target.value })} />
            ) : (
              <p className="text-sm text-gray-900">{profile?.headline || <span className="text-gray-400">Not set</span>}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bio</label>
            {editingProfile ? (
              <textarea className="input-field text-sm resize-none" rows={4} placeholder="Tell us about yourself..."
                value={profileForm.bio || ''} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
            ) : (
              <p className="text-sm text-gray-900">{profile?.bio || <span className="text-gray-400">Not set</span>}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'linkedin_url', label: 'LinkedIn URL' },
              { key: 'github_url', label: 'GitHub URL' },
              { key: 'portfolio_url', label: 'Portfolio URL' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                {editingProfile ? (
                  <input className="input-field text-sm" placeholder="https://"
                    value={profileForm[key] || ''} onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })} />
                ) : (
                  profile?.[key]
                    ? <a href={profile[key]} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate block">{profile[key]}</a>
                    : <span className="text-sm text-gray-400">Not set</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {tab === 'skills' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Skills</h2>
            <button onClick={() => setAddingSkill(true)} className="btn-primary text-sm py-1.5 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {addingSkill && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Skill Name</label>
                  <input className="input-field text-sm" placeholder="e.g. React.js"
                    value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Proficiency</label>
                  <select className="input-field text-sm" value={skillForm.proficiency}
                    onChange={e => setSkillForm({ ...skillForm, proficiency: e.target.value })}>
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Years</label>
                  <input type="number" min={0} className="input-field text-sm" value={skillForm.years_of_experience}
                    onChange={e => setSkillForm({ ...skillForm, years_of_experience: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addSkill} className="btn-primary text-sm py-1.5 px-4">Add</button>
                <button onClick={() => setAddingSkill(false)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
              </div>
            </div>
          )}

          {skills.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No skills added yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-2 rounded-lg group">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-xs text-primary-400">{skill.proficiency}</span>
                  <button onClick={() => deleteSkill(skill.id)} className="text-primary-300 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Education */}
      {tab === 'education' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Education</h2>
            <button onClick={() => setAddingEdu(true)} className="btn-primary text-sm py-1.5 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {addingEdu && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Institution</label>
                  <input className="input-field text-sm" placeholder="University name"
                    value={eduForm.institution} onChange={e => setEduForm({ ...eduForm, institution: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Degree</label>
                  <input className="input-field text-sm" placeholder="B.Sc. Computer Science"
                    value={eduForm.degree} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Field of Study</label>
                  <input className="input-field text-sm" placeholder="Computer Science"
                    value={eduForm.field_of_study} onChange={e => setEduForm({ ...eduForm, field_of_study: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                  <input type="date" className="input-field text-sm"
                    value={eduForm.start_date} onChange={e => setEduForm({ ...eduForm, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                  <input type="date" className="input-field text-sm" disabled={eduForm.is_current}
                    value={eduForm.end_date} onChange={e => setEduForm({ ...eduForm, end_date: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={eduForm.is_current} onChange={e => setEduForm({ ...eduForm, is_current: e.target.checked, end_date: '' })} />
                Currently studying here
              </label>
              <div className="flex gap-2">
                <button onClick={addEducation} className="btn-primary text-sm py-1.5 px-4">Save</button>
                <button onClick={() => setAddingEdu(false)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
              </div>
            </div>
          )}

          {education.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No education added yet</p>
          ) : (
            <div className="space-y-3">
              {education.map(edu => (
                <div key={edu.id} className="p-4 bg-gray-50 rounded-xl flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    {edu.field_of_study && <p className="text-xs text-gray-400">{edu.field_of_study}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {edu.start_date} – {edu.is_current ? 'Present' : edu.end_date || 'N/A'}
                    </p>
                  </div>
                  <button onClick={async () => { await profileAPI.deleteEducation(edu.id); setEducation(prev => prev.filter(e => e.id !== edu.id)) }}
                    className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {tab === 'experience' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Work Experience</h2>
            <button onClick={() => setAddingExp(true)} className="btn-primary text-sm py-1.5 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {addingExp && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
                  <input className="input-field text-sm" placeholder="Company name"
                    value={expForm.company_name} onChange={e => setExpForm({ ...expForm, company_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Job Title</label>
                  <input className="input-field text-sm" placeholder="Software Engineer"
                    value={expForm.job_title} onChange={e => setExpForm({ ...expForm, job_title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                  <input type="date" className="input-field text-sm"
                    value={expForm.start_date} onChange={e => setExpForm({ ...expForm, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                  <input type="date" className="input-field text-sm" disabled={expForm.is_current}
                    value={expForm.end_date} onChange={e => setExpForm({ ...expForm, end_date: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                  <textarea className="input-field text-sm resize-none" rows={3}
                    value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={expForm.is_current} onChange={e => setExpForm({ ...expForm, is_current: e.target.checked, end_date: '' })} />
                Currently working here
              </label>
              <div className="flex gap-2">
                <button onClick={addExperience} className="btn-primary text-sm py-1.5 px-4">Save</button>
                <button onClick={() => setAddingExp(false)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
              </div>
            </div>
          )}

          {experience.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No experience added yet</p>
          ) : (
            <div className="space-y-3">
              {experience.map(exp => (
                <div key={exp.id} className="p-4 bg-gray-50 rounded-xl flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{exp.job_title}</p>
                    <p className="text-sm text-gray-600">{exp.company_name}</p>
                    {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                    </p>
                    {exp.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{exp.description}</p>}
                  </div>
                  <button onClick={async () => { await profileAPI.deleteExperience(exp.id); setExperience(prev => prev.filter(e => e.id !== exp.id)) }}
                    className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
