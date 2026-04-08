import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'
import ImpactDashboardPage from './ImpactDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'
import ProcessRecordingPage from './ProcessRecordingPage'
import CaseloadInventoryPage from './CaseloadInventoryPage'
import ReportsAnalyticsPage from './ReportsAnalyticsPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import HomeVisitationCaseConferencesPage from './HomeVisitationCaseConferencesPage'
import DonatePage from './pages/protected/DonatePage'
import DonorsContributionsPage from './DonorsContributionsPage'

function PublicLandingWrapper() {
  return (
    <>
      <LandingPage />
      <CookieConsent />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLandingWrapper />} />
          <Route path="/impact-dashboard" element={<ImpactDashboardPage />} />
          <Route path="/privacy-notice" element={<PrivacyNoticePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/donate" element={<ProtectedRoute><DonatePage /></ProtectedRoute>} />

          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute requiredRole="Admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/donors-contributions" element={<ProtectedRoute requiredRole="Admin"><DonorsContributionsPage /></ProtectedRoute>} />
          <Route path="/process-recording" element={<ProtectedRoute requiredRole="Admin"><ProcessRecordingPage /></ProtectedRoute>} />
          <Route path="/home-visitation-case-conferences" element={<ProtectedRoute requiredRole="Admin"><HomeVisitationCaseConferencesPage /></ProtectedRoute>} />
          <Route path="/caseload-inventory" element={<ProtectedRoute requiredRole="Admin"><CaseloadInventoryPage /></ProtectedRoute>} />
          <Route path="/reports-analytics" element={<ProtectedRoute requiredRole="Admin"><ReportsAnalyticsPage /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
