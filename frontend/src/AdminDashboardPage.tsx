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

const PIPELINE_PROBLEMS = [
  {
    name: 'inactive_supporter_risk',
    businessProblem:
      'Which active supporters are at risk of going silent so staff can intervene before donor lapse?',
  },
  {
    name: 'counseling-intensity-readiness-effect',
    businessProblem:
      'How does counseling count/intensity relate to later reintegration readiness, and where should case effort be prioritized?',
  },
  {
    name: 'donor-recurrence-forecast',
    businessProblem:
      'Which donors are likely to give again soon, so outreach timing and campaign targeting can be optimized?',
  },
  {
    name: 'reintegration-readiness',
    businessProblem:
      'Which residents are most likely to be reintegration-ready, to support case planning and case conference decisions?',
  },
  {
    name: 'resident-risk-escalation',
    businessProblem:
      'Which resident cases show early signs of risk escalation so staff can trigger preventive actions quickly?',
  },
  {
    name: 'social-content-donation-impact',
    businessProblem:
      'Which social content patterns are associated with stronger donation outcomes to guide outreach strategy?',
  },
]

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
  const risk = data.inactiveSupporterRisk

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

        <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="mb-3 text-lg font-semibold text-stone-900">ML Pipelines and Business Problems</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {PIPELINE_PROBLEMS.map((pipeline) => (
              <article key={pipeline.name} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-stone-500">Pipeline</p>
                <p className="mt-1 font-semibold text-teal-700">{pipeline.name}</p>
                <p className="mt-3 text-sm text-stone-700">{pipeline.businessProblem}</p>
              </article>
            ))}
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
