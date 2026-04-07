import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'
import ImpactDashboardPage from './ImpactDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'
import ProcessRecordingPage from './ProcessRecordingPage'

export default function App() {
  const isPrivacyNoticePage = window.location.pathname === '/privacy-notice'
  const isImpactDashboardPage = window.location.pathname === '/impact-dashboard'
  const isAdminDashboardPage = window.location.pathname === '/admin-dashboard'
  const isProcessRecordingPage = window.location.pathname === '/process-recording'

  if (isPrivacyNoticePage) {
    return <PrivacyNoticePage />
  }

  if (isImpactDashboardPage) {
    return <ImpactDashboardPage />
  }

  if (isAdminDashboardPage) {
    return <AdminDashboardPage />
  }

  if (isProcessRecordingPage) {
    return <ProcessRecordingPage />
  }

  return (
    <>
      <LandingPage />
      <CookieConsent />
    </>
  )
}
