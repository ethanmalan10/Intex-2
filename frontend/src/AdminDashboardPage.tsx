import { useEffect, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'

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
  const apiUrl = `${API_BASE_URL}/api/admin-dashboard`

  useEffect(() => {
    fetch(apiUrl)
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((json: AdminData) => {
        setData(json)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Live API unavailable (${msg}). Showing fallback preview data from mock values.`)
        setData(FALLBACK)
      })
  }, [apiUrl])

  const cc = data.commandCenter

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="mt-2 text-stone-600">
            Daily operations overview: resident capacity, donation flow, upcoming conferences, and inactive-supporter pipeline risk.
          </p>
          <p className="mt-2 text-sm text-stone-500">Updated: {new Date(data.generatedAtUtc).toLocaleString()}</p>
          <p className="mt-1 text-xs text-stone-400">API source: <code>{apiUrl}</code></p>
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
      </div>
    </PublicLayout>
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
