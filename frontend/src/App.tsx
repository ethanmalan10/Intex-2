import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'
import ImpactDashboardPage from './ImpactDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'

export default function App() {
  const isPrivacyNoticePage = window.location.pathname === '/privacy-notice'
  const isImpactDashboardPage = window.location.pathname === '/impact-dashboard'
  const isAdminDashboardPage = window.location.pathname === '/admin-dashboard'

  if (isPrivacyNoticePage) {
    return <PrivacyNoticePage />
  }

  if (isImpactDashboardPage) {
    return <ImpactDashboardPage />
  }

  if (isAdminDashboardPage) {
    return <AdminDashboardPage />
  }

  return (
    <>
      <LandingPage />
      <CookieConsent />
    </>
  )
}
