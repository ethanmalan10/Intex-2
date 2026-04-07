import LandingPage from './LandingPage'
import CookieConsent from './CookieConsent'
import PrivacyNoticePage from './PrivacyNoticePage'

export default function App() {
  const isPrivacyNoticePage = window.location.pathname === '/privacy-notice'

  if (isPrivacyNoticePage) {
    return <PrivacyNoticePage />
  }

  return (
    <>
      <LandingPage />
      <CookieConsent />
    </>
  )
}
