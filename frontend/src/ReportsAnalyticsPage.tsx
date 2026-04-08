import { useEffect, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

type ReportsData = {
  generatedAtUtc: string
  inactiveSupporterRisk: {
    topAtRisk: Array<{
      displayName: string
      riskBand: 'High' | 'Medium' | 'Low'
    }>
  }
  donorRecurrenceForecast: {
    topLikelyToDonateAgain: string[]
  }
  reintegrationReadiness: {
    topLikelyReadyResidents: string[]
  }
  residentRiskEscalation: {
    topEscalationResidents: string[]
  }
  pipelineVisuals?: {
    inactiveSupporterRisk?: {
      riskBandCounts: Array<{ label: string; value: number }>
    }
    counselingIntensityReadinessEffect?: {
      readinessRateComparison: Array<{ label: string; value: number }>
    }
    donorRecurrenceForecast?: {
      topLikelyDonorScores: Array<{ name: string; score: number }>
    }
    reintegrationReadiness?: {
      readinessOverview: Array<{ label: string; value: number }>
    }
    residentRiskEscalation?: {
      escalationSignalCounts: Array<{ label: string; value: number }>
    }
    socialContentDonationImpact?: {
      donationImpactSummary: Array<{ label: string; value: number }>
    }
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
    topAtRisk: [],
  },
  donorRecurrenceForecast: {
    topLikelyToDonateAgain: [],
  },
  reintegrationReadiness: {
    topLikelyReadyResidents: [],
  },
  residentRiskEscalation: {
    topEscalationResidents: [],
  },
  pipelineVisuals: {},
  pipelineResults: [],
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
        setData({
          ...FALLBACK,
          ...json,
          inactiveSupporterRisk: json.inactiveSupporterRisk ?? FALLBACK.inactiveSupporterRisk,
          donorRecurrenceForecast: json.donorRecurrenceForecast ?? FALLBACK.donorRecurrenceForecast,
          reintegrationReadiness: json.reintegrationReadiness ?? FALLBACK.reintegrationReadiness,
          residentRiskEscalation: json.residentRiskEscalation ?? FALLBACK.residentRiskEscalation,
          pipelineResults: json.pipelineResults ?? [],
        })
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
  const topFiveLikelyDonors = data.donorRecurrenceForecast.topLikelyToDonateAgain.slice(0, 5)
  const topFiveLikelyReadyResidents = data.reintegrationReadiness.topLikelyReadyResidents.slice(0, 5)
  const topFiveEscalationResidents = data.residentRiskEscalation.topEscalationResidents.slice(0, 5)

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
                {pipeline.name === 'donor-recurrence-forecast' && (
                  <div className="mt-3 text-sm text-stone-700">
                    <p className="font-semibold">Top 5 most likely to donate again:</p>
                    {topFiveLikelyDonors.length === 0 ? (
                      <p className="mt-1 text-stone-500">No likely-repeat donors found.</p>
                    ) : (
                      <ol className="mt-1 list-decimal space-y-1 pl-5">
                        {topFiveLikelyDonors.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
                {pipeline.name === 'reintegration-readiness' && (
                  <div className="mt-3 text-sm text-stone-700">
                    <p className="font-semibold">Top 5 most likely ready residents:</p>
                    {topFiveLikelyReadyResidents.length === 0 ? (
                      <p className="mt-1 text-stone-500">No likely-ready residents found.</p>
                    ) : (
                      <ol className="mt-1 list-decimal space-y-1 pl-5">
                        {topFiveLikelyReadyResidents.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
                {pipeline.name === 'resident-risk-escalation' && (
                  <div className="mt-3 text-sm text-stone-700">
                    <p className="font-semibold">Top 5 residents by escalation risk:</p>
                    {topFiveEscalationResidents.length === 0 ? (
                      <p className="mt-1 text-stone-500">No escalation-risk residents found.</p>
                    ) : (
                      <ol className="mt-1 list-decimal space-y-1 pl-5">
                        {topFiveEscalationResidents.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
                {pipeline.name === 'inactive_supporter_risk' && data.pipelineVisuals?.inactiveSupporterRisk?.riskBandCounts && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.pipelineVisuals.inactiveSupporterRisk.riskBandCounts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0f766e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'counseling-intensity-readiness-effect' && data.pipelineVisuals?.counselingIntensityReadinessEffect?.readinessRateComparison && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.pipelineVisuals.counselingIntensityReadinessEffect.readinessRateComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'donor-recurrence-forecast' && data.pipelineVisuals?.donorRecurrenceForecast?.topLikelyDonorScores && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.pipelineVisuals.donorRecurrenceForecast.topLikelyDonorScores}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" hide />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'reintegration-readiness' && data.pipelineVisuals?.reintegrationReadiness?.readinessOverview && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.pipelineVisuals.reintegrationReadiness.readinessOverview}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#059669" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'resident-risk-escalation' && data.pipelineVisuals?.residentRiskEscalation?.escalationSignalCounts && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.pipelineVisuals.residentRiskEscalation.escalationSignalCounts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'social-content-donation-impact' && data.pipelineVisuals?.socialContentDonationImpact?.donationImpactSummary && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.pipelineVisuals.socialContentDonationImpact.donationImpactSummary}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#ea580c" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>
            ))}
            {data.pipelineResults.length === 0 && (
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-stone-600">No pipeline results available yet. Add or refresh source data, then reload this page.</p>
              </article>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
