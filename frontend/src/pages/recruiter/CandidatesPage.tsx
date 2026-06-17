import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { applicationsAPI, jobsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Users, ArrowLeft, Calendar, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_OPTIONS = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED']
const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  INTERVIEWED: 'bg-cyan-100 text-cyan-700',
  OFFERED: 'bg-green-100 text-green-700',
  HIRED: 'bg-green-200 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function CandidatesPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [scheduleForm, setScheduleForm] = useState({ interview_type: 'VIDEO', scheduled_at: '', duration_minutes: 60, video_link: '', notes: '' })
  const [showSchedule, setShowSchedule] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => { loadData() }, [jobId])

  const loadData = async () => {
    try {
      const [jobRes, candsRes] = await Promise.all([
        jobsAPI.get(Number(jobId)),
        applicationsAPI.getJobCandidates(Number(jobId)),
      ])
      setJob(jobRes.data)
      setCandidates(candsRes.data)
    } catch { toast.error('Failed to load candidates') }
    finally { setLoading(false) }
  }

  const updateStatus = async (appId: number, status: string) => {
    try {
      await applicationsAPI.updateStatus(appId, { status })
      setCandidates(prev => prev.map(c => c.id === appId ? { ...c, status } : c))
      toast.success('Status updated')
    } catch { toast.error('Failed to update status') }
  }

  const saveNote = async (appId: number) => {
    try {
      await applicationsAPI.updateStatus(appId, { recruiter_notes: noteText })
      setCandidates(prev => prev.map(c => c.id === appId ? { ...c, recruiter_notes: noteText } : c))
      setNoteText('')
      toast.success('Note saved')
    } catch { toast.error('Failed to save note') }
  }

  const scheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return
    try {
      await applicationsAPI.scheduleInterview({ application_id: selectedApp.id, ...scheduleForm })
      toast.success('Interview scheduled!')
      setShowSchedule(false)
      await updateStatus(selectedApp.id, 'INTERVIEW_SCHEDULED')
    } catch { toast.error('Failed to schedule interview') }
  }

  const filtered = filterStatus ? candidates.filter(c => c.status === filterStatus) : candidates

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/recruiter/jobs" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job?.title || 'Job'} — Candidates</h1>
          <p className="text-gray-500 mt-0.5">{candidates.length} total applicants</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${!filterStatus ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>
          All ({candidates.length})
        </button>
        {STATUS_OPTIONS.map(s => {
          const count = candidates.filter(c => c.status === s).length
          if (count === 0) return null
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${filterStatus === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>
              {s.replace('_', ' ')} ({count})
            </button>
          )
        })}
      </div>

      {/* Schedule interview modal */}
      {showSchedule && selectedApp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 mb-4">Schedule Interview</h2>
            <p className="text-sm text-gray-500 mb-4">Application #{selectedApp.id}</p>
            <form onSubmit={scheduleInterview} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                  <select className="input-field text-sm" value={scheduleForm.interview_type}
                    onChange={e => setScheduleForm({ ...scheduleForm, interview_type: e.target.value })}>
                    {['VIDEO', 'PHONE', 'IN_PERSON', 'TECHNICAL', 'HR'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (min)</label>
                  <input type="number" className="input-field text-sm" value={scheduleForm.duration_minutes}
                    onChange={e => setScheduleForm({ ...scheduleForm, duration_minutes: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date & Time *</label>
                <input required type="datetime-local" className="input-field text-sm"
                  value={scheduleForm.scheduled_at}
                  onChange={e => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Video Link</label>
                <input className="input-field text-sm" placeholder="https://meet.google.com/..."
                  value={scheduleForm.video_link}
                  onChange={e => setScheduleForm({ ...scheduleForm, video_link: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                <textarea className="input-field text-sm resize-none" rows={3}
                  value={scheduleForm.notes}
                  onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex-1">Schedule</button>
                <button type="button" onClick={() => setShowSchedule(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No candidates found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app: any) => (
            <div key={app.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-900">Applicant #{app.user_id}</span>
                    <span className={`badge ${STATUS_COLORS[app.status] || 'bg-gray-100'}`}>{app.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                  </div>
                  {app.cover_letter && (
                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg line-clamp-2">
                      💌 {app.cover_letter}
                    </p>
                  )}
                  {app.recruiter_notes && (
                    <p className="text-xs text-gray-500 mt-1">📝 Note: {app.recruiter_notes}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => { setSelectedApp(app); setShowSchedule(true) }}
                    title="Schedule interview" className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </button>
                  <Link to={`/${app.user_id === undefined ? '#' : 'seeker'}/messages`}
                    title="Message candidate" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Status change + notes */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium">Move to:</span>
                  {['SHORTLISTED', 'REJECTED', 'OFFERED', 'HIRED'].map(s => (
                    <button key={s} onClick={() => updateStatus(app.id, s)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:opacity-90 ${STATUS_COLORS[s]}`}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  <input className="input-field text-xs py-1 flex-1 sm:w-48"
                    placeholder="Add note..."
                    value={app.id === selectedApp?.id ? noteText : ''}
                    onFocus={() => setSelectedApp(app)}
                    onChange={e => { setSelectedApp(app); setNoteText(e.target.value) }} />
                  <button onClick={() => saveNote(app.id)} className="btn-primary text-xs py-1 px-3 whitespace-nowrap">Save</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
