import { useEffect, useState } from 'react'

type AdminData = {
  generatedAtUtc: string
  commandCenter: {
    activeResidents: number
    donationsLast30Count: number
    donationsLast30Amount: number
    upcomingCaseConferences14d: number
    progressNotedRate30d: number
  }
  inactiveSupporterRisk: {
    activeSupporters: number
    highRiskCount: number
    mediumRiskCount: number
    lowRiskCount: number
    topAtRisk: Array<{
      supporterId: number
      displayName: string
      recencyDays: number
      frequency365: number
      channelCount365: number
      recurringShare365: number
      riskScore: number
      riskBand: 'High' | 'Medium' | 'Low'
    }>
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

const FALLBACK: AdminData = {
  generatedAtUtc: new Date().toISOString(),
  commandCenter: {
    activeResidents: 47,
    donationsLast30Count: 108,
    donationsLast30Amount: 42500,
    upcomingCaseConferences14d: 11,
    progressNotedRate30d: 74.5,
  },
  inactiveSupporterRisk: {
    activeSupporters: 120,
    highRiskCount: 18,
    mediumRiskCount: 41,
    lowRiskCount: 61,
    topAtRisk: [
      { supporterId: 101, displayName: 'Sample Supporter A', recencyDays: 204, frequency365: 1, channelCount365: 1, recurringShare365: 0, riskScore: 0.88, riskBand: 'High' },
      { supporterId: 102, displayName: 'Sample Supporter B', recencyDays: 176, frequency365: 1, channelCount365: 1, recurringShare365: 0, riskScore: 0.81, riskBand: 'High' },
      { supporterId: 103, displayName: 'Sample Supporter C', recencyDays: 149, frequency365: 2, channelCount365: 1, recurringShare365: 0, riskScore: 0.74, riskBand: 'High' },
    ],
  },
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData>(FALLBACK)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const url = `${API_BASE_URL}/api/admin-dashboard`
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: AdminData) => {
        setData(json)
        setLoadError(null)
      })
      .catch(() => {
        setLoadError('Live API unavailable. Showing fallback preview data.')
        setData(FALLBACK)
      })
  }, [])

  const cc = data.commandCenter
  const risk = data.inactiveSupporterRisk

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-teal-700">
            <img src="/logo.png" alt="BrighterPath logo" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-lg font-semibold">BrighterPath</span>
          </a>
          <span className="text-sm text-stone-500">Admin Command Center</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="mt-2 text-stone-600">
          Daily operations overview: resident capacity, donation flow, upcoming conferences, and inactive-supporter pipeline risk.
        </p>
        <p className="mt-2 text-sm text-stone-500">Updated: {new Date(data.generatedAtUtc).toLocaleString()}</p>
        {loadError && <p className="mt-2 text-sm text-amber-700">{loadError}</p>}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi title="Active Residents" value={cc.activeResidents.toLocaleString()} />
          <Kpi title="Donations (30d)" value={cc.donationsLast30Count.toLocaleString()} />
          <Kpi title="Donation Amount (30d)" value={`$${cc.donationsLast30Amount.toLocaleString()}`} />
          <Kpi title="Case Conferences (14d)" value={cc.upcomingCaseConferences14d.toLocaleString()} />
          <Kpi title="Progress Noted Rate (30d)" value={`${cc.progressNotedRate30d}%`} />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Inactive Supporter Pipeline Snapshot</h2>
          <p className="mt-1 text-sm text-stone-600">
            Risk flags are computed from donation recency, frequency, channel diversity, and recurring behavior.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Badge label="Active Supporters" value={risk.activeSupporters} />
            <Badge label="High Risk" value={risk.highRiskCount} tone="high" />
            <Badge label="Medium Risk" value={risk.mediumRiskCount} tone="medium" />
            <Badge label="Low Risk" value={risk.lowRiskCount} tone="low" />
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Recommended Staff Action</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
            <li>Prioritize outreach to high-risk supporters within 7 days.</li>
            <li>Use a re-engagement channel that differs from their last donation channel.</li>
            <li>Offer recurring options to medium-risk supporters with long recency gaps.</li>
          </ul>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Top At-Risk Active Supporters</h2>
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-700">
                <th className="py-2 pr-4">Supporter</th>
                <th className="py-2 pr-4">Risk Band</th>
                <th className="py-2 pr-4">Risk Score</th>
                <th className="py-2 pr-4">Recency (days)</th>
                <th className="py-2 pr-4">Donations (365d)</th>
                <th className="py-2">Channels (365d)</th>
              </tr>
            </thead>
            <tbody>
              {risk.topAtRisk.map((r) => (
                <tr key={r.supporterId} className="border-b border-stone-100">
                  <td className="py-2 pr-4">{r.displayName}</td>
                  <td className="py-2 pr-4">{r.riskBand}</td>
                  <td className="py-2 pr-4">{r.riskScore.toFixed(3)}</td>
                  <td className="py-2 pr-4">{r.recencyDays}</td>
                  <td className="py-2 pr-4">{r.frequency365}</td>
                  <td className="py-2">{r.channelCount365}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-teal-700">{value}</p>
    </article>
  )
}

function Badge({
  label,
  value,
  tone = 'low',
}: {
  label: string
  value: number
  tone?: 'low' | 'medium' | 'high'
}) {
  const toneClass =
    tone === 'high'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : tone === 'medium'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <p className="text-xs">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
