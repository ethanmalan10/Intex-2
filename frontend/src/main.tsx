import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import {
  CONSENT_EVENT_NAME,
  type ConsentPreferences,
  getConsentPreferences,
} from './consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

function loadGoogleAnalytics(measurementId: string) {
  if (document.querySelector('script[data-cookie-category="analytics"]')) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script.setAttribute('data-cookie-category', 'analytics')
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { anonymize_ip: true })
}

function removeAnalyticsScripts() {
  document
    .querySelectorAll('script[data-cookie-category="analytics"]')
    .forEach((el) => el.remove())
}

function applyConsent(consent: ConsentPreferences | null) {
  // Default GDPR posture: no non-essential analytics without explicit opt-in.
  if (!GA_MEASUREMENT_ID) return
  if (consent?.analytics) {
    loadGoogleAnalytics(GA_MEASUREMENT_ID)
    return
  }
  removeAnalyticsScripts()
}

applyConsent(getConsentPreferences())
window.addEventListener(CONSENT_EVENT_NAME, (event: Event) => {
  const detail = (event as CustomEvent<ConsentPreferences>).detail
  applyConsent(detail)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
