import { useEffect, useState } from 'react'
import {
  type ConsentPreferences,
  getConsentPreferences,
  saveConsentPreferences,
} from './consent'

export default function CookieConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = getConsentPreferences()
    if (saved) {
      setPreferences(saved)
      setAnalyticsEnabled(saved.analytics)
      setOpen(false)
      return
    }
    setOpen(true)
  }, [])

  function applyConsent(next: ConsentPreferences) {
    saveConsentPreferences(next)
    setPreferences(next)
    setAnalyticsEnabled(next.analytics)
    setOpen(false)
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-4 left-4 right-4 z-[999] md:left-auto md:max-w-md rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
          <p className="text-sm font-semibold text-stone-800">Cookie Preferences</p>
          <p className="mt-2 text-xs leading-relaxed text-stone-600">
            We use essential cookies to keep this site working. With your permission, we also use
            analytics cookies to improve performance and user experience.
          </p>
          <div className="mt-3 rounded-xl border border-stone-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-stone-800">Essential cookies</p>
                <p className="text-[11px] text-stone-500">Required for security and core site features.</p>
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-600">
                Always on
              </span>
            </div>
          </div>
          <div className="mt-2 rounded-xl border border-stone-200 p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-stone-800">Analytics cookies</p>
                <p className="text-[11px] text-stone-500">Help us understand site performance and improve content.</p>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="h-4 w-4 accent-teal-600"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => applyConsent({ essential: true, analytics: false })}
              className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={() => applyConsent({ essential: true, analytics: true })}
              className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Accept All
            </button>
            <button
              onClick={() => applyConsent({ essential: true, analytics: analyticsEnabled })}
              className="rounded-full border border-teal-300 px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
            >
              Save Preferences
            </button>
          </div>
          <p className="mt-2 text-[11px] text-stone-500">
            You can change this anytime with Cookie Settings. Read our <a href="/privacy-notice" className="underline">Privacy Notice</a>.
          </p>
        </div>
      )}

      {!open && preferences && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-[998] rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 shadow hover:bg-stone-50"
        >
          Cookie Settings
        </button>
      )}
    </>
  )
}
