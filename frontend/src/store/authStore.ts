import { create } from 'zustand'
import { authAPI } from '../services/api'

interface User {
  id: number
  email: string
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN'
  is_active: boolean
  is_verified: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      const me = await authAPI.me()
      set({ user: me.data, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  register: async (formData) => {
    set({ loading: true })
    try {
      await authAPI.register(formData)
      set({ loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { set({ initialized: true }); return }
    try {
      const { data } = await authAPI.me()
      set({ user: data, initialized: true })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, initialized: true })
    }
  },
}))
