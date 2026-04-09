import { useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import { useAuth } from '../../context/AuthContext'
import { getAuthToken } from '../../utils/authToken'

const API = import.meta.env.VITE_API_BASE_URL

const AMOUNTS = [10, 25, 50, 100, 250, 500, 750, 1000]
const AMOUNT_DESCRIPTIONS: Record<number, string> = {
  10: "Provides daily nutritious meals for one girl for an entire week",
  25: "Supplies school books and materials for one child's month",
  50: "Funds one full trauma counseling session with a licensed therapist",
  100: "Covers one month of safe shelter and housing for one child",
  250: "Provides three months of medical care and wellness checkups",
  500: "Sponsors a full semester of education and holistic support",
  750: "Equips our team to rescue and house three girls in immediate danger",
  1000: "Funds a full month of comprehensive care for five survivors",
}

export default function DonatePage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>('')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'pending' | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(AMOUNTS[0])
  const [customAmount, setCustomAmount] = useState('')
  const [customError, setCustomError] = useState('')
  const [pendingAmount, setPendingAmount] = useState<number | null>(null)

  async function donate(amount: number) {
    const token = getAuthToken()
    if (!token) {
      setStatusType('error')
      setStatus('Please sign in before donating.')
      return
    }
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

  function submitSelectedDonation() {
    if (customAmount.trim()) {
      submitCustomAmount()
      return
    }
    if (!selectedAmount) {
      setCustomError('Select an amount or enter a custom amount.')
      return
    }
    setCustomError('')
    openConfirm(selectedAmount)
  }

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-100 text-stone-800 py-10 px-4">
        <section className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-teal-700">
            <img src="/logo.png" alt="Esperanca Brasil logo" className="h-7 w-7 rounded-full object-cover" />
            <p className="text-lg font-medium italic">BrighterPath</p>
          </div>

          <h1 className="mt-5 text-center text-5xl leading-tight text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>
            Restore Her Hope,
            <br />
            <span className="mt-5 text-center text-5xl leading-tight text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>Rebuild Her Life</span>
          </h1>
          <p className="mt-4 text-center text-stone-500 text-lg">
            Your gift directly supports girl survivors of abuse in Brazil
            <br className="hidden sm:block" /> - providing meals, shelter, counseling, and safety.
          </p>

          <div className="mt-7 border-t border-stone-200" />

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                  setCustomError('')
                }}
                disabled={isSubmitting}
                className={`rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                  selectedAmount === amount && !customAmount.trim()
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-stone-300 bg-white hover:border-teal-400'
                }`}
              >
                <p className="text-4xl font-bold text-teal-700">${amount.toLocaleString()}</p>
                <p className="mt-1 text-sm text-stone-500">{AMOUNT_DESCRIPTIONS[amount]}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-stone-300 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-base font-semibold text-teal-800">Custom Amount</p>
                <p className="text-xs text-stone-500">Every dollar makes a real difference in a child's life.</p>
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setCustomError('')
                  setSelectedAmount(null)
                }}
                placeholder="$ 0.00"
                className="w-32 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={submitSelectedDonation}
            disabled={isSubmitting}
            className="mt-4 w-full rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white hover:bg-teal-800 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            Donate Securely
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400">
            <span>256-bit encrypted</span>
            <span>501(c)(3) nonprofit</span>
            <span>100% to the cause</span>
          </div>

          {customError && <p className="mt-3 text-center text-xs text-rose-700">{customError}</p>}
          {status && (
            <p className={`mt-4 text-center text-sm ${statusType === 'error' ? 'text-rose-700' : statusType === 'success' ? 'text-teal-700' : 'text-stone-600'}`}>
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
