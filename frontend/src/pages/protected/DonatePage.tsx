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
  const [customAmount, setCustomAmount] = useState('')
  const [customError, setCustomError] = useState('')
  const [pendingAmount, setPendingAmount] = useState<number | null>(null)

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

  function openConfirm(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      setStatusType('error')
      setStatus('Donation failed. Please enter a valid amount.')
      return
    }
    setPendingAmount(amount)
  }

  function submitCustomAmount() {
    const parsed = Number(customAmount)
    if (!customAmount.trim() || !Number.isFinite(parsed) || parsed <= 0) {
      setCustomError('Enter a valid amount greater than 0.')
      return
    }
    setCustomError('')
    openConfirm(parsed)
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
                onClick={() => openConfirm(amount)}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                ${amount}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex w-full max-w-xs items-center gap-2">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={submitCustomAmount}
                disabled={isSubmitting}
                className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                Donate
              </button>
            </div>
            {customError && <p className="text-xs text-rose-700">{customError}</p>}
          </div>
          {status && (
            <p className={`mt-6 text-sm ${statusType === 'error' ? 'text-rose-700' : statusType === 'success' ? 'text-teal-700' : 'text-stone-600'}`}>
              {status}
            </p>
          )}
        </section>

        {pendingAmount !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
            <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-stone-800">Confirm Donation</h2>
              <p className="mt-2 text-sm text-stone-600">
                Are you sure you want to donate ${pendingAmount}?
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingAmount(null)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const amountToDonate = pendingAmount
                    setPendingAmount(null)
                    void donate(amountToDonate)
                  }}
                  className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
