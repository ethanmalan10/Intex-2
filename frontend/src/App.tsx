import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'
import ImpactDashboardPage from './ImpactDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'
import LoginPage from './pages/public/LoginPage'

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

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Legacy paths redirect */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
