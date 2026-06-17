import { useState, useEffect } from 'react'
import { notificationsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Bell, CheckCheck, Briefcase, Calendar, MessageSquare, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS: Record<string, any> = {
  JOB_ALERT: Briefcase,
  APPLICATION_UPDATE: CheckCheck,
  INTERVIEW_SCHEDULED: Calendar,
  INTERVIEW_REMINDER: Calendar,
  MESSAGE: MessageSquare,
  SYSTEM: Info,
}

const TYPE_COLORS: Record<string, string> = {
  JOB_ALERT: 'bg-blue-100 text-blue-600',
  APPLICATION_UPDATE: 'bg-green-100 text-green-600',
  INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-600',
  INTERVIEW_REMINDER: 'bg-amber-100 text-amber-600',
  MESSAGE: 'bg-primary-100 text-primary-600',
  SYSTEM: 'bg-gray-100 text-gray-600',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    try { const { data } = await notificationsAPI.list(); setNotifications(data) }
    catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }

  const markRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No notifications</h3>
          <p className="text-gray-400 text-sm mt-1">We'll notify you about job updates, interviews, and more</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = TYPE_ICONS[n.type] || Bell
            const iconColor = TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'
            return (
              <button key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                className={`w-full text-left card flex items-start gap-4 transition-all hover:shadow-md ${!n.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
