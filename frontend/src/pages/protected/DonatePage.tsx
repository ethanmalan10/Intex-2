import { useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

const API = import.meta.env.VITE_API_BASE_URL

const AMOUNTS = [50, 150, 500]

export default function DonatePage() {
  const [status, setStatus] = useState<string>('')
  const token = localStorage.getItem('token')

  async function donate(amount: number) {
    if (!token) return
    setStatus('Processing donation...')
    try {
      const res = await fetch(`${API}/api/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, notes: 'Website donation flow' }),
      })
      if (!res.ok) {
        setStatus('Donation failed. Please try again.')
        return
      }
      setStatus(`Thank you! Donation of $${amount} recorded successfully.`)
    } catch {
      setStatus('Donation failed. Please try again.')
    }
  }

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-4xl px-6 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800">Donate Securely</h1>
          <p className="mt-3 text-stone-500">Choose an amount to record your donation.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => donate(amount)}
                className="px-8 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
              >
                ${amount}
              </button>
            ))}
          </div>
          {status && <p className="mt-6 text-sm text-stone-600">{status}</p>}
        </section>
      </div>
    </PublicLayout>
  )
}
