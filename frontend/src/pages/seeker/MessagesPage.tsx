import { useState, useEffect, useRef } from 'react'
import { messagesAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { MessageSquare, Send, User } from 'lucide-react'
import { format } from 'date-fns'
import { useAuthStore } from '../../store/authStore'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [inbox, setInbox] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [conversation, setConversation] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [composeForm, setComposeForm] = useState({ receiver_id: '', subject: '', content: '' })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadInbox() }, [])
  useEffect(() => {
    if (selected) loadConversation(selected.sender_id === user?.id ? selected.receiver_id : selected.sender_id)
  }, [selected])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [conversation])

  const loadInbox = async () => {
    try {
      const { data } = await messagesAPI.inbox()
      setInbox(data)
    } catch { toast.error('Failed to load messages') }
  }

  const loadConversation = async (otherUserId: number) => {
    try {
      const { data } = await messagesAPI.conversation(otherUserId)
      setConversation(data)
    } catch { toast.error('Failed to load conversation') }
  }

  const sendReply = async () => {
    if (!newMsg.trim() || !selected) return
    setSending(true)
    const otherId = selected.sender_id === user?.id ? selected.receiver_id : selected.sender_id
    try {
      await messagesAPI.send({ receiver_id: otherId, content: newMsg })
      setNewMsg('')
      loadConversation(otherId)
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await messagesAPI.send({
        receiver_id: Number(composeForm.receiver_id),
        subject: composeForm.subject,
        content: composeForm.content,
      })
      toast.success('Message sent!')
      setShowCompose(false)
      setComposeForm({ receiver_id: '', subject: '', content: '' })
      loadInbox()
    } catch { toast.error('Failed to send message') }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Communicate with recruiters and candidates</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" /> Compose
        </button>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 mb-4">New Message</h2>
            <form onSubmit={handleCompose} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient User ID</label>
                <input required type="number" className="input-field" placeholder="User ID"
                  value={composeForm.receiver_id} onChange={e => setComposeForm({ ...composeForm, receiver_id: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input className="input-field" placeholder="Subject (optional)"
                  value={composeForm.subject} onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea required className="input-field resize-none" rows={5} placeholder="Write your message..."
                  value={composeForm.content} onChange={e => setComposeForm({ ...composeForm, content: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex-1">Send Message</button>
                <button type="button" onClick={() => setShowCompose(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Inbox list */}
          <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">Inbox</div>
            <div className="flex-1 overflow-y-auto">
              {inbox.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                inbox.map((msg: any) => (
                  <button key={msg.id} onClick={() => setSelected(msg)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected?.id === msg.id ? 'bg-primary-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        User #{msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id}
                      </span>
                      {!msg.is_read && msg.receiver_id === user?.id && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 ml-auto" />
                      )}
                    </div>
                    {msg.subject && <p className="text-xs font-medium text-gray-700 truncate">{msg.subject}</p>}
                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.content}</p>
                    <p className="text-xs text-gray-300 mt-1">{format(new Date(msg.created_at), 'MMM d')}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation view */}
          <div className="flex-1 flex flex-col min-w-0">
            {selected ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      User #{selected.sender_id === user?.id ? selected.receiver_id : selected.sender_id}
                    </p>
                    {selected.subject && <p className="text-xs text-gray-400">{selected.subject}</p>}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversation.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                        msg.sender_id === user?.id ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-primary-200' : 'text-gray-400'}`}>
                          {format(new Date(msg.created_at), 'p')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <input
                      className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-primary-400 transition-colors"
                      placeholder="Type a message..."
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    />
                    <button onClick={sendReply} disabled={sending || !newMsg.trim()} className="btn-primary p-2.5 disabled:opacity-40">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a conversation to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
