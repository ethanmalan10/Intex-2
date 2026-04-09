import { useEffect, useMemo, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import { useAuth } from '../../context/AuthContext'
import { getAuthToken } from '../../utils/authToken'

const API = import.meta.env.VITE_API_BASE_URL

type ProfileResponse = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  totalDonations: number
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export default function MyProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setIsLoading(false)
      setError('You need to be signed in to view profile details.')
      return
    }

    fetch(`${API}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (HTTP ${res.status}).`)
        return res.json()
      })
      .then((payload: ProfileResponse) => {
        setProfile(payload)
        setError('')
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Unable to load profile details.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const displayName = useMemo(() => {
    const firstName = profile?.firstName?.trim() || user?.firstName?.trim() || ''
    const lastName = profile?.lastName?.trim() || user?.lastName?.trim() || ''
    const combined = `${firstName} ${lastName}`.trim()
    if (combined) return combined
    return profile?.email || user?.email || 'Donor'
  }, [profile, user])

  const email = profile?.email || user?.email || 'Not available'
  const totalDonations = usdFormatter.format(Number(profile?.totalDonations ?? 0))
  const firstName = displayName.split(' ')[0] || 'there'

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-800">
        <section className="mx-auto w-full max-w-5xl space-y-6">
          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">My Profile</p>
            <h1 className="mt-2 text-3xl font-bold text-stone-900">Welcome back, {firstName}</h1>
            <p className="mt-2 text-stone-600">
              View your account details and giving summary in one place.
            </p>
          </article>

          {error ? (
            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 shadow-sm">
              {error}
            </article>
          ) : null}

          <section className="grid gap-4 md:grid-cols-3" aria-label="Profile summary">
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-stone-500">Name</p>
              <p className="mt-2 text-xl font-semibold text-stone-900">
                {isLoading ? 'Loading...' : displayName}
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-stone-500">Email</p>
              <p className="mt-2 break-all text-base font-medium text-stone-900">
                {isLoading ? 'Loading...' : email}
              </p>
            </article>
            <article className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-teal-700">Total Personal Donations</p>
              <p className="mt-2 text-2xl font-bold text-teal-700">
                {isLoading ? 'Loading...' : totalDonations}
              </p>
            </article>
          </section>

          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Donor impact snapshot</h2>
            <p className="mt-2 text-sm text-stone-600">
              Your generosity directly supports shelter, counseling, and reintegration services for girls in Brazil.
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  )
}
