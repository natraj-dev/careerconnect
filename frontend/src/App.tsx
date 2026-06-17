import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import MainLayout from './components/common/MainLayout'
import DashboardLayout from './components/common/DashboardLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Public Pages
import HomePage from './pages/HomePage'
import JobsPage from './pages/jobs/JobsPage'
import JobDetailPage from './pages/jobs/JobDetailPage'
import CompaniesPage from './pages/companies/CompaniesPage'
import CompanyDetailPage from './pages/companies/CompanyDetailPage'

// Job Seeker Pages
import SeekerDashboard from './pages/seeker/SeekerDashboard'
import ProfilePage from './pages/seeker/ProfilePage'
import ResumePage from './pages/seeker/ResumePage'
import ApplicationsPage from './pages/seeker/ApplicationsPage'
import SavedJobsPage from './pages/seeker/SavedJobsPage'
import InterviewsPage from './pages/seeker/InterviewsPage'
import AIAssistantPage from './pages/seeker/AIAssistantPage'
import MessagesPage from './pages/seeker/MessagesPage'
import NotificationsPage from './pages/seeker/NotificationsPage'
import SubscriptionsPage from './pages/seeker/SubscriptionsPage'

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import ManageJobsPage from './pages/recruiter/ManageJobsPage'
import CreateJobPage from './pages/recruiter/CreateJobPage'
import CandidatesPage from './pages/recruiter/CandidatesPage'
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage'
import AdminJobsPage from './pages/admin/AdminJobsPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { fetchMe } = useAuthStore()
  useEffect(() => { fetchMe() }, [fetchMe])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Job Seeker */}
        <Route element={<ProtectedRoute roles={['JOB_SEEKER']}><DashboardLayout role="JOB_SEEKER" /></ProtectedRoute>}>
          <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
          <Route path="/seeker/profile" element={<ProfilePage />} />
          <Route path="/seeker/resume" element={<ResumePage />} />
          <Route path="/seeker/applications" element={<ApplicationsPage />} />
          <Route path="/seeker/saved-jobs" element={<SavedJobsPage />} />
          <Route path="/seeker/interviews" element={<InterviewsPage />} />
          <Route path="/seeker/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/seeker/messages" element={<MessagesPage />} />
          <Route path="/seeker/notifications" element={<NotificationsPage />} />
          <Route path="/seeker/subscription" element={<SubscriptionsPage />} />
        </Route>

        {/* Recruiter */}
        <Route element={<ProtectedRoute roles={['RECRUITER', 'ADMIN']}><DashboardLayout role="RECRUITER" /></ProtectedRoute>}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/jobs" element={<ManageJobsPage />} />
          <Route path="/recruiter/jobs/create" element={<CreateJobPage />} />
          <Route path="/recruiter/jobs/:id/edit" element={<CreateJobPage />} />
          <Route path="/recruiter/candidates/:jobId" element={<CandidatesPage />} />
          <Route path="/recruiter/company" element={<CompanyProfilePage />} />
          <Route path="/recruiter/messages" element={<MessagesPage />} />
          <Route path="/recruiter/notifications" element={<NotificationsPage />} />
          <Route path="/recruiter/subscription" element={<SubscriptionsPage />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout role="ADMIN" /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/companies" element={<AdminCompaniesPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
