import { useEffect, useState } from 'react'

export default function PrivacyNoticePage() {
  const [content, setContent] = useState<string>('Loading Privacy Notice...')

  useEffect(() => {
    fetch('/privacy_notice.txt')
      .then((r) => r.text())
      .then((txt) => setContent(txt))
      .catch(() => setContent('Unable to load Privacy Notice. Please try again later.'))
  }, [])

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 text-stone-800">
      <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <a href="/" className="mb-6 inline-block text-sm font-medium text-teal-700 hover:text-teal-800">
          {'<- Back to Home'}
        </a>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-7">{content}</pre>
      </div>
    </main>
  )
}
