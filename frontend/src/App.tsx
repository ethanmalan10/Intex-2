import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'
import ImpactDashboardPage from './ImpactDashboardPage'

export default function App() {
  const isPrivacyNoticePage = window.location.pathname === '/privacy-notice'
  const isImpactDashboardPage = window.location.pathname === '/impact-dashboard'

  if (isPrivacyNoticePage) {
    return <PrivacyNoticePage />
  }

  if (isImpactDashboardPage) {
    return <ImpactDashboardPage />
  }

  return (
    <>
      <LandingPage />
      <CookieConsent />
    </>
  )
}
