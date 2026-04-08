import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'
import ImpactDashboardPage from './ImpactDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'
import ProcessRecordingPage from './ProcessRecordingPage'
import CaseloadInventoryPage from './CaseloadInventoryPage'

export default function App() {
  const isPrivacyNoticePage = window.location.pathname === '/privacy-notice'
  const isImpactDashboardPage = window.location.pathname === '/impact-dashboard'
  const isAdminDashboardPage = window.location.pathname === '/admin-dashboard'
  const isProcessRecordingPage = window.location.pathname === '/process-recording'
  const isCaseloadInventoryPage = window.location.pathname === '/caseload-inventory'

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

  if (isCaseloadInventoryPage) {
    return <CaseloadInventoryPage />
  }

  return (
    <>
      <LandingPage />
      <CookieConsent />
    </>
  )
}
