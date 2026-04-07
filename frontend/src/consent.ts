export type ConsentPreferences = {
  essential: true
  analytics: boolean
}

export const CONSENT_STORAGE_KEY = 'cookie_consent_preferences_v1'
export const CONSENT_EVENT_NAME = 'cookie-consent-updated'

export function getConsentPreferences(): ConsentPreferences | null {
  const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>
    if (typeof parsed.analytics !== 'boolean') return null
    return { essential: true, analytics: parsed.analytics }
  } catch {
    return null
  }
}

export function saveConsentPreferences(next: ConsentPreferences): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(
    new CustomEvent(CONSENT_EVENT_NAME, {
      detail: next,
    })
  )
}
