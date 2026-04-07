import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'
import ImpactDashboardPage from './ImpactDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'
import ProcessRecordingPage from './ProcessRecordingPage'
import ReportsAnalyticsPage from './ReportsAnalyticsPage'

export default function App() {
  const isPrivacyNoticePage = window.location.pathname === '/privacy-notice'
  const isImpactDashboardPage = window.location.pathname === '/impact-dashboard'
  const isAdminDashboardPage = window.location.pathname === '/admin-dashboard'
  const isProcessRecordingPage = window.location.pathname === '/process-recording'
  const isReportsAnalyticsPage = window.location.pathname === '/reports-analytics'

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

  if (isReportsAnalyticsPage) {
    return <ReportsAnalyticsPage />
  }

  return (
    <>
      <LandingPage />
      <CookieConsent />
    </>
  )
}
