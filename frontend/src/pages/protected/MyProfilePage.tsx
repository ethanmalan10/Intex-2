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
  const totalDonationsRaw = Number(profile?.totalDonations ?? 0)
  const totalDonations = usdFormatter.format(totalDonationsRaw)
  const firstName = displayName.split(' ')[0] || 'there'
  const estimatedLivesImpacted = Math.max(1, Math.floor(totalDonationsRaw / 125))
  const counselingSessionsSupported = Math.floor(totalDonationsRaw / 50)
  const monthsOfCareFunded = (totalDonationsRaw / 100).toFixed(1)

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <main className="relative min-h-screen overflow-hidden px-4 py-10 text-stone-800">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/girlsrelaxed.jpeg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-white/72" aria-hidden="true" />
        <section className="relative z-10 mx-auto w-full max-w-6xl space-y-5">
          <article className="rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">My Profile</p>
            <h1 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">Welcome back, {firstName}</h1>
            <p className="mt-2 text-lg font-medium text-stone-700">Here&apos;s the impact you&apos;re making.</p>
            <p className="mt-2 text-sm text-stone-500 sm:text-base">
              Your account details and donor impact are updated in real time from your profile.
            </p>
          </article>

          {error ? (
            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 shadow-sm">
              {error}
            </article>
          ) : null}

          <section className="grid items-stretch gap-4 lg:grid-cols-3" aria-label="Profile summary">
            <article className="rounded-2xl border border-teal-200 bg-white/92 p-6 shadow-sm backdrop-blur-sm lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Featured Contribution</p>
              <h2 className="mt-2 text-xl font-semibold text-stone-900">Total Personal Donations</h2>
              <p className="mt-3 text-6xl font-extrabold text-teal-700 sm:text-7xl">
                {isLoading ? 'Loading...' : totalDonations}
              </p>
              <p className="mt-3 text-base text-stone-600 sm:text-lg">
                You&apos;ve contributed <span className="font-semibold text-teal-700">{isLoading ? '...' : totalDonations}</span> to changing lives.
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white/92 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500">Profile Details</p>
              <p className="mt-3 text-sm text-stone-500">Name</p>
              <p className="mt-2 text-xl font-semibold text-stone-900">
                {isLoading ? 'Loading...' : displayName}
              </p>
              <p className="mt-4 text-sm text-stone-500">Email</p>
              <p className="mt-2 break-all text-base font-medium text-stone-900">
                {isLoading ? 'Loading...' : email}
              </p>
            </article>
          </section>

          <section className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Supporting donor metrics">
            <article className="rounded-2xl border border-stone-200 bg-white/92 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-medium text-stone-500">Estimated lives impacted</p>
              <p className="mt-2 text-3xl font-bold text-teal-700">{isLoading ? '...' : estimatedLivesImpacted}</p>
              <p className="mt-2 text-xs text-stone-500 sm:text-sm">Estimated from current lifetime giving.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white/92 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-medium text-stone-500">Counseling sessions supported</p>
              <p className="mt-2 text-3xl font-bold text-teal-700">{isLoading ? '...' : counselingSessionsSupported}</p>
              <p className="mt-2 text-xs text-stone-500 sm:text-sm">Approximation based on average session funding.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white/92 p-5 shadow-sm backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-stone-500">Months of care funded</p>
              <p className="mt-2 text-3xl font-bold text-teal-700">{isLoading ? '...' : monthsOfCareFunded}</p>
              <p className="mt-2 text-xs text-stone-500 sm:text-sm">Estimated months of direct shelter and care.</p>
            </article>
          </section>

          <article className="rounded-2xl border-l-4 border-l-teal-500 border-teal-100 bg-teal-50/86 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-semibold text-teal-800">Donor impact snapshot</h2>
                <p className="mt-3 text-sm text-stone-700 sm:text-base">
                  Your generosity helps provide safe shelter, trauma-informed counseling, and reintegration support for girls rebuilding their futures.
                </p>
                <p className="mt-3 text-xs text-teal-800 sm:text-sm">
                  Thank you for standing with survivors and helping create lasting local impact.
                </p>
              </div>
            </div>
          </article>
        </section>
      </main>
    </PublicLayout>
  )
}
