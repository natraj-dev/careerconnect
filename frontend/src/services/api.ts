import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refresh_token: refresh })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
}

// ─── Profile ───────────────────────────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get('/profile/'),
  create: (data: any) => api.post('/profile/', data),
  update: (data: any) => api.put('/profile/', data),
  uploadPicture: (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/profile/picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getSkills: () => api.get('/profile/skills'),
  addSkill: (data: any) => api.post('/profile/skills', data),
  updateSkill: (id: number, data: any) => api.put(`/profile/skills/${id}`, data),
  deleteSkill: (id: number) => api.delete(`/profile/skills/${id}`),
  getEducation: () => api.get('/profile/education'),
  addEducation: (data: any) => api.post('/profile/education', data),
  updateEducation: (id: number, data: any) => api.put(`/profile/education/${id}`, data),
  deleteEducation: (id: number) => api.delete(`/profile/education/${id}`),
  getExperience: () => api.get('/profile/experience'),
  addExperience: (data: any) => api.post('/profile/experience', data),
  updateExperience: (id: number, data: any) => api.put(`/profile/experience/${id}`, data),
  deleteExperience: (id: number) => api.delete(`/profile/experience/${id}`),
}

// ─── Resume ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  list: () => api.get('/resumes/'),
  upload: (title: string, file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post(`/resumes/upload?title=${encodeURIComponent(title)}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  delete: (id: number) => api.delete(`/resumes/${id}`),
  setDefault: (id: number) => api.post(`/resumes/${id}/set-default`),
}

// ─── Jobs ──────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  list: (params?: any) => api.get('/jobs/', { params }),
  get: (id: number) => api.get(`/jobs/${id}`),
  create: (data: any) => api.post('/jobs/', data),
  update: (id: number, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: number) => api.delete(`/jobs/${id}`),
  publish: (id: number) => api.post(`/jobs/${id}/publish`),
  save: (id: number) => api.post(`/jobs/${id}/save`),
  getSaved: () => api.get('/jobs/saved/list'),
  getRecommended: () => api.get('/jobs/recommended/list'),
  getCategories: () => api.get('/jobs/categories'),
  createCategory: (data: any) => api.post('/jobs/categories', data),
}

// ─── Applications ──────────────────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (data: any) => api.post('/applications/', data),
  myApplications: () => api.get('/applications/my'),
  withdraw: (id: number) => api.put(`/applications/${id}/withdraw`),
  getJobCandidates: (jobId: number, status?: string) =>
    api.get(`/applications/job/${jobId}/candidates`, { params: { status } }),
  updateStatus: (id: number, data: any) => api.put(`/applications/${id}/status`, data),
  scheduleInterview: (data: any) => api.post('/applications/interviews', data),
  updateInterview: (id: number, data: any) => api.put(`/applications/interviews/${id}`, data),
  myInterviews: () => api.get('/applications/interviews/my'),
}

// ─── Companies ─────────────────────────────────────────────────────────────────
export const companiesAPI = {
  list: () => api.get('/companies/'),
  get: (id: number) => api.get(`/companies/${id}`),
  create: (data: any) => api.post('/companies/', data),
  update: (id: number, data: any) => api.put(`/companies/${id}`, data),
  uploadLogo: (id: number, file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post(`/companies/${id}/logo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getMyRecruiterProfile: () => api.get('/companies/recruiters/me'),
  createRecruiterProfile: (data: any) => api.post('/companies/recruiters', data),
  updateRecruiterProfile: (data: any) => api.put('/companies/recruiters/me', data),
}

// ─── Notifications & Messages ──────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  unreadCount: () => api.get('/notifications/unread-count'),
}

export const messagesAPI = {
  send: (data: any) => api.post('/messages/', data),
  inbox: () => api.get('/messages/inbox'),
  sent: () => api.get('/messages/sent'),
  conversation: (userId: number) => api.get(`/messages/conversation/${userId}`),
  markRead: (id: number) => api.put(`/messages/${id}/read`),
}

// ─── AI Assistant ──────────────────────────────────────────────────────────────
export const aiAPI = {
  ask: (message: string) => api.post('/ai/career-assistant', { message }),
  resumeSuggestions: () => api.post('/ai/resume-suggestions'),
  interviewPrep: (jobId: number) => api.post(`/ai/interview-prep/${jobId}`),
}

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params?: any) => api.get('/admin/users', { params }),
  toggleUserActive: (id: number) => api.put(`/admin/users/${id}/toggle-active`),
  verifyCompany: (id: number) => api.put(`/admin/companies/${id}/verify`),
  verifyRecruiter: (id: number) => api.put(`/admin/recruiters/${id}/verify`),
  toggleFeaturedJob: (id: number) => api.put(`/admin/jobs/${id}/feature`),
  analytics: () => api.get('/admin/analytics'),
  auditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
}

// ─── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsAPI = {
  listPlans: () => api.get('/subscriptions/plans'),
  subscribe: (planId: number) => api.post('/subscriptions/subscribe', { plan_id: planId }),
  mySubscription: () => api.get('/subscriptions/my'),
  paymentHistory: () => api.get('/subscriptions/payment-history'),
  cancel: () => api.post('/subscriptions/cancel'),
  seedPlans: () => api.post('/subscriptions/plans/seed'),
}

// ─── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews/', data),
  getCompanyReviews: (companyId: number) => api.get(`/reviews/company/${companyId}`),
  getCompanyRating: (companyId: number) => api.get(`/reviews/company/${companyId}/rating`),
}

// ─── Payments ──────────────────────────────────────────────
export const paymentsAPI = {
  createOrder: (planId: number) =>
    api.post(`/payments/create-order?plan_id=${planId}`)
}