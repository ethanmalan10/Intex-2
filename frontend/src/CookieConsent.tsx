import { useEffect, useState } from 'react'

type ConsentChoice = 'accepted' | 'rejected'

const STORAGE_KEY = 'cookie_consent_choice'

export default function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ConsentChoice | null
    if (saved === 'accepted' || saved === 'rejected') {
      setChoice(saved)
      setOpen(false)
      return
    }
    setOpen(true)
  }, [])

  function saveConsent(next: ConsentChoice) {
    localStorage.setItem(STORAGE_KEY, next)
    setChoice(next)
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
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => saveConsent('rejected')}
              className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={() => saveConsent('accepted')}
              className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Accept All
            </button>
          </div>
          <p className="mt-2 text-[11px] text-stone-500">
            You can change this choice anytime with the Cookie Settings button.
          </p>
        </div>
      )}

      {!open && choice && (
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
