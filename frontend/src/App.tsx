import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import LandingPage from './LandingPage'
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
import MyProfilePage from './pages/protected/MyProfilePage'
import DonorsContributionsPage from './DonorsContributionsPage'
import CookieConsent from './CookieConsent'

function PublicLandingWrapper() {
  return <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CookieConsent />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLandingWrapper />} />
          <Route path="/impact-dashboard" element={<ImpactDashboardPage />} />
          <Route path="/privacy-notice" element={<PrivacyNoticePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/donate" element={<ProtectedRoute><DonatePage /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />

          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute requiredRole="Admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/donors-contributions" element={<ProtectedRoute requiredRoles={['Admin', 'staff']}><DonorsContributionsPage /></ProtectedRoute>} />
          <Route path="/process-recording" element={<ProtectedRoute requiredRoles={['Admin', 'staff']}><ProcessRecordingPage /></ProtectedRoute>} />
          <Route path="/home-visitation-case-conferences" element={<ProtectedRoute requiredRoles={['Admin', 'staff']}><HomeVisitationCaseConferencesPage /></ProtectedRoute>} />
          <Route path="/caseload-inventory" element={<ProtectedRoute requiredRoles={['Admin', 'staff']}><CaseloadInventoryPage /></ProtectedRoute>} />
          <Route path="/reports-analytics" element={<ProtectedRoute requiredRoles={['Admin', 'staff']}><ReportsAnalyticsPage /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
