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
      name: 'inactive_supporter_risk',
      businessProblem: 'Which active supporters are at risk of going silent so staff can intervene before donor lapse?',
      runStatus: 'Preview fallback',
      results: ['Active supporters scored: 120', 'High risk: 18, Medium risk: 41, Low risk: 61', 'Top risk score: 0.880'],
    },
  ],
}

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
        setData(json)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Live API unavailable (${msg}). Showing fallback preview data.`)
        setData(FALLBACK)
      })
  }, [apiUrl])

  const topFiveHighRiskNames = (
    data.inactiveSupporterRisk.topAtRisk.filter((s) => s.riskBand === 'High').slice(0, 5).length > 0
      ? data.inactiveSupporterRisk.topAtRisk.filter((s) => s.riskBand === 'High').slice(0, 5)
      : data.inactiveSupporterRisk.topAtRisk.slice(0, 5)
  ).map((s) => s.displayName)

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
                {pipeline.name === 'inactive_supporter_risk' && (
                  <div className="mt-3 text-sm text-stone-700">
                    <p className="font-semibold">Top 5 most at-risk supporters:</p>
                    {topFiveHighRiskNames.length === 0 ? (
                      <p className="mt-1 text-stone-500">No high-risk supporters found.</p>
                    ) : (
                      <ol className="mt-1 list-decimal space-y-1 pl-5">
                        {topFiveHighRiskNames.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
