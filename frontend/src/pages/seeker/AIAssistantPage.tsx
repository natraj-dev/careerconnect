import { useState } from 'react'
import { aiAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { Bot, Send, Lightbulb, FileText, Calendar, Sparkles } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = [
  { icon: FileText, label: 'Improve my resume', prompt: 'Please analyze my profile and give me specific suggestions to improve my resume.' },
  { icon: Lightbulb, label: 'Career guidance', prompt: 'Based on my profile, what career paths should I explore and what skills should I develop?' },
  { icon: Sparkles, label: 'Skill gaps', prompt: 'What are the key skill gaps I should fill to advance in my career?' },
  { icon: Calendar, label: 'Interview tips', prompt: 'Give me top interview tips and common questions I should prepare for.' },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI Career Assistant 🤖 I can help you with resume improvements, career guidance, skill recommendations, and interview preparation. What would you like to work on today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const { data } = await aiAPI.ask(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      toast.error('AI service unavailable')
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble processing that. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 flex flex-col h-[calc(100vh-6rem)]">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="w-7 h-7 text-primary-600" />
          AI Career Assistant
        </h1>
        <p className="text-gray-500 mt-1">
          Personalized career guidance powered by Claude AI
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => sendMessage(prompt)}
            className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left text-sm font-medium text-gray-700"
          >
            <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="line-clamp-2">{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>

              <div className="bg-gray-50 rounded-2xl rounded-bl-sm border border-gray-100 px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <input
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-200 focus:border-primary-400 transition-colors"
              placeholder="Ask me anything about your career..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn-primary p-3 disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}