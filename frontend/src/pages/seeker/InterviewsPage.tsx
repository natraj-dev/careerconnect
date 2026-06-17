import { useState, useEffect } from 'react'
import { applicationsAPI } from '../../services/api'
import { Calendar, Video, MapPin, Clock, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  RESCHEDULED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsAPI.myInterviews()
      .then(r => setInterviews(r.data))
      .catch(() => toast.error('Failed to load interviews'))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = interviews.filter(i => new Date(i.scheduled_at) > new Date())
  const past = interviews.filter(i => new Date(i.scheduled_at) <= new Date())

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="text-gray-500 mt-1">{upcoming.length} upcoming interview{upcoming.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? <div className="card animate-pulse h-32" /> : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((i: any) => (
                  <div key={i.id} className="card border-l-4 border-l-primary-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${STATUS_COLORS[i.status] || 'bg-gray-100'}`}>{i.status}</span>
                          <span className="badge bg-purple-100 text-purple-700">{i.interview_type}</span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            {format(new Date(i.scheduled_at), 'PPpp')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {i.duration_minutes} minutes
                          </div>
                          {i.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {i.location}
                            </div>
                          )}
                          {i.video_link && (
                            <a href={i.video_link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary-600 hover:underline">
                              <Video className="w-4 h-4" />
                              Join Video Interview
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {i.notes && <p className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">📝 {i.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Past Interviews</h2>
              <div className="space-y-3">
                {past.map((i: any) => (
                  <div key={i.id} className="card opacity-80">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${STATUS_COLORS[i.status] || 'bg-gray-100'}`}>{i.status}</span>
                          <span className="text-sm text-gray-500">{i.interview_type} · {format(new Date(i.scheduled_at), 'PP')}</span>
                        </div>
                        {i.feedback && <p className="text-sm text-gray-600 mt-1">Feedback: {i.feedback}</p>}
                        {i.rating && <p className="text-sm text-gray-500">Rating: {'⭐'.repeat(i.rating)}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {interviews.length === 0 && (
            <div className="card text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No interviews scheduled</h3>
              <p className="text-gray-400 text-sm mt-1">Keep applying — interviews will appear here</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
