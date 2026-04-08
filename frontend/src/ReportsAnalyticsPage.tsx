import { useEffect, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'

type ReportsData = {
  generatedAtUtc: string
  inactiveSupporterRisk: {
    topAtRisk: Array<{
      displayName: string
      riskBand: 'High' | 'Medium' | 'Low'
    }>
  }
  pipelineResults: Array<{
    name: string
    businessProblem: string
    runStatus: string
    results: string[]
  }>
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

const FALLBACK: ReportsData = {
  generatedAtUtc: new Date().toISOString(),
  inactiveSupporterRisk: {
    topAtRisk: [
      { displayName: 'Sample Supporter A', riskBand: 'High' },
      { displayName: 'Sample Supporter B', riskBand: 'High' },
      { displayName: 'Sample Supporter C', riskBand: 'High' },
      { displayName: 'Sample Supporter D', riskBand: 'Medium' },
      { displayName: 'Sample Supporter E', riskBand: 'Medium' },
    ],
  },
  pipelineResults: [
    {
      name: 'Inactive Supporter Risk',
      businessProblem: 'Which active supporters are at risk of going silent so staff can intervene before donor lapse?',
      runStatus: 'Preview fallback',
      results: ['Active supporters scored: 120', 'High risk: 18, Medium risk: 41, Low risk: 61', 'Top risk score: 0.880'],
    },
    {
      name: 'Counseling Intensity Readiness Effect',
      businessProblem: 'How does counseling intensity relate to readiness so case effort can be prioritized?',
      runStatus: 'Preview fallback',
      results: ['Residents evaluated: 60', 'High-intensity residents: 18', 'Readiness rate high vs low intensity: 23.0% vs 31.0%'],
    },
    {
      name: 'Donor Recurrence Forecast',
      businessProblem: 'Which donors are likely to donate again soon so outreach timing can be optimized?',
      runStatus: 'Preview fallback',
      results: ['Supporters with usable window: 98', 'Observed donate-again rate (day 61-240): 44.0%', 'Recent donations (30d): 108'],
    },
    {
      name: 'Reintegration Readiness',
      businessProblem: 'Which residents are likely ready for reintegration to support case conference decisions?',
      runStatus: 'Preview fallback',
      results: ['Residents evaluated: 60', 'Closed within 365 days of enrollment: 27.0%', 'Median days-to-close among closed cases: 180'],
    },
    {
      name: 'Resident Risk Escalation',
      businessProblem: 'Which resident cases are escalating so preventive interventions happen earlier?',
      runStatus: 'Preview fallback',
      results: ['Residents with concerns flagged in last 90d: 14', 'Residents with severe incidents: 9', 'Total residents flagged by escalation signals: 19'],
    },
    {
      name: 'Social Content Donation Impact',
      businessProblem: 'Which social content is associated with stronger donation outcomes?',
      runStatus: 'Preview fallback',
      results: ['Donations with social referral post id: 37', 'Average donation from social referrals: 742.50', 'Top platform by referred donations: Instagram (21 referred donations)'],
    },
  ],
}

const REQUIRED_PIPELINE_ORDER = [
  'Inactive Supporter Risk',
  'Counseling Intensity Readiness Effect',
  'Donor Recurrence Forecast',
  'Reintegration Readiness',
  'Resident Risk Escalation',
  'Social Content Donation Impact',
] as const

export default function ReportsAnalyticsPage() {
  const [data, setData] = useState<ReportsData>(FALLBACK)
  const [loadError, setLoadError] = useState<string | null>(null)
  const apiUrl = `${API_BASE_URL}/api/admin-dashboard`

  useEffect(() => {
    fetch(apiUrl)
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((json: ReportsData) => {
        const mergedPipelineResults = REQUIRED_PIPELINE_ORDER.map((name) => {
          return json.pipelineResults.find((p) => p.name === name)
            ?? FALLBACK.pipelineResults.find((p) => p.name === name)!
        })
        setData({ ...json, pipelineResults: mergedPipelineResults })
        setLoadError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Live API unavailable (${msg}). Showing fallback preview data.`)
        setData(FALLBACK)
      })
  }, [apiUrl])

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold text-stone-900">Reports & Analytics</h1>
          <p className="mt-2 text-stone-600">
            Pipeline-level reporting for decision support, monitoring, and operational planning.
          </p>
          <p className="mt-2 text-sm text-stone-500">Updated: {new Date(data.generatedAtUtc).toLocaleString()}</p>
          {loadError && <p className="mt-2 text-sm text-amber-700">{loadError}</p>}
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="mb-3 text-lg font-semibold text-stone-900">Pipeline Results by Use Case</h2>
          <div className="space-y-4">
            {data.pipelineResults.map((pipeline) => (
              <article key={pipeline.name} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-stone-500">Pipeline</p>
                <p className="mt-1 font-semibold text-teal-700">{pipeline.name}</p>
                <p className="mt-2 text-sm text-stone-700"><strong>Business problem:</strong> {pipeline.businessProblem}</p>
                <p className="mt-2 text-sm text-stone-600"><strong>Status:</strong> {pipeline.runStatus}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
                  {pipeline.results.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
