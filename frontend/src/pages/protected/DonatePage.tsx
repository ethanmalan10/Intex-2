import { useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import { useAuth } from '../../context/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL

const AMOUNTS = [50, 150, 500]

export default function DonatePage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>('')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'pending' | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function donate(amount: number) {
    const token = localStorage.getItem('token')
    if (!token) return
    if (!Number.isFinite(amount) || amount <= 0) {
      setStatusType('error')
      setStatus('Donation failed. Please enter a valid amount.')
      return
    }
    if (isSubmitting) return

    setStatusType('pending')
    setStatus('Processing donation...')
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API}/api/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          notes: 'Website donation flow',
          firstName: user?.firstName,
          lastName: user?.lastName,
          displayName: user?.firstName?.trim() || user?.email,
        }),
      })
      if (!res.ok) {
        setStatusType('error')
        setStatus('Donation failed. Please try again.')
        return
      }
      setStatusType('success')
      setStatus(`Thank you for your donation. Your $${amount} gift was recorded successfully.`)
    } catch {
      setStatusType('error')
      setStatus('Donation failed. Please try again.')
    } finally {
      setIsSubmitting(false)
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
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                ${amount}
              </button>
            ))}
          </div>
          {status && (
            <p className={`mt-6 text-sm ${statusType === 'error' ? 'text-rose-700' : statusType === 'success' ? 'text-teal-700' : 'text-stone-600'}`}>
              {status}
            </p>
          )}
        </section>
      </div>
    </PublicLayout>
  )
}
