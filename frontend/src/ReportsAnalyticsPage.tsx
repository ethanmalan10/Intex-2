import { useEffect, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

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
  const token = localStorage.getItem('token') ?? ''

  useEffect(() => {
    fetch(apiUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
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
  const topFiveEscalationResidents = data.residentRiskEscalation.topEscalationResidents.slice(0, 5)
  const residentEscalationGroupedData = (() => {
    const counts = data.pipelineVisuals?.residentRiskEscalation?.escalationSignalCounts ?? []
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    const normCounts = counts.map((item) => ({ ...item, normalizedLabel: normalize(item.label) }))

    const concernsFlagged =
      normCounts.find((item) => item.normalizedLabel.includes('concern'))?.value ?? 0
    const severeIncidents =
      normCounts.find((item) => item.normalizedLabel.includes('severe'))?.value ?? 0
    const explicitTotalFlagged = normCounts.find(
      (item) =>
        item.normalizedLabel.includes('total') ||
        (item.normalizedLabel.includes('resident') && item.normalizedLabel.includes('flagged')) ||
        item.normalizedLabel.includes('overall')
    )?.value
    const totalFlagged = explicitTotalFlagged ?? Math.max(concernsFlagged + severeIncidents, concernsFlagged, severeIncidents)

    return [{ group: 'Escalation Categories', concernsFlagged, severeIncidents, totalFlagged }]
  })()
  const reintegrationDonutDataFromVisuals = (() => {
    const overview = data.pipelineVisuals?.reintegrationReadiness?.readinessOverview ?? []
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

    const closedWithin365 =
      overview.find((item) => normalize(item.label).includes('closed') && normalize(item.label).includes('365'))?.value ?? 0
    const explicitRemaining =
      overview.find((item) => normalize(item.label).includes('remaining'))?.value
    const total =
      overview.find((item) => normalize(item.label).includes('total'))?.value

    const remaining =
      explicitRemaining ?? (typeof total === 'number' ? Math.max(total - closedWithin365, 0) : 0)

    return [
      { label: 'Closed within 365 days', value: closedWithin365 },
      { label: 'Remaining', value: remaining },
    ]
  })()
  const donorTopTenChartData = (() => {
    const scores = data.pipelineVisuals?.donorRecurrenceForecast?.topLikelyDonorScores ?? []
    return [...scores].sort((a, b) => b.score - a.score).slice(0, 10)
  })()
  const counselingReadinessGroupedData = (() => {
    const comparison = data.pipelineVisuals?.counselingIntensityReadinessEffect?.readinessRateComparison ?? []
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

    const highIntensity =
      comparison.find((item) => normalize(item.label).includes('high'))?.value ?? 0
    const lowIntensity =
      comparison.find((item) => normalize(item.label).includes('low'))?.value ?? 0

    return [{ group: 'Readiness Rate', highIntensity, lowIntensity }]
  })()
  const inactiveSupporterRiskPieData = (() => {
    const counts = data.pipelineVisuals?.inactiveSupporterRisk?.riskBandCounts ?? []
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

    const high = counts.find((item) => normalize(item.label).includes('high'))?.value ?? 0
    const medium = counts.find((item) => normalize(item.label).includes('medium'))?.value ?? 0
    const low = counts.find((item) => normalize(item.label).includes('low'))?.value ?? 0

    return [
      { label: 'High', value: high, color: '#dc2626' },
      { label: 'Medium', value: medium, color: '#f59e0b' },
      { label: 'Low', value: low, color: '#16a34a' },
    ]
  })()
  const socialPlatformDonationsData = (() => {
    const summary = data.pipelineVisuals?.socialContentDonationImpact?.donationImpactSummary ?? []

    return summary
      .map((item) => {
        const cleaned = item.label
          .replace(/referred/gi, '')
          .replace(/donations?/gi, '')
          .replace(/impact/gi, '')
          .replace(/[:\-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        const platform = cleaned.length > 0 ? cleaned : item.label
        return { platform, totalDonations: item.value }
      })
      .sort((a, b) => b.totalDonations - a.totalDonations)
  })()

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
                {pipeline.name === 'Inactive Supporter Risk' && (
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
                {pipeline.name === 'Resident Risk Escalation' && (
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
                {pipeline.name === 'Inactive Supporter Risk' && data.pipelineVisuals?.inactiveSupporterRisk?.riskBandCounts && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Legend />
                        <Pie
                          data={inactiveSupporterRiskPieData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={82}
                        >
                          {inactiveSupporterRiskPieData.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'Counseling Intensity Readiness Effect' && data.pipelineVisuals?.counselingIntensityReadinessEffect?.readinessRateComparison && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={counselingReadinessGroupedData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="group" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="highIntensity" name="High Intensity" fill="#2563eb" />
                        <Bar dataKey="lowIntensity" name="Low Intensity" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'Donor Recurrence Forecast' && data.pipelineVisuals?.donorRecurrenceForecast?.topLikelyDonorScores && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={donorTopTenChartData} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis type="category" dataKey="name" width={110} />
                        <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Likelihood Score']} />
                        <Bar dataKey="score" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'Reintegration Readiness' && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Legend />
                        <Pie
                          data={(() => {
                            const hasVisualValues = reintegrationDonutDataFromVisuals.some((d) => d.value > 0)
                            if (hasVisualValues) return reintegrationDonutDataFromVisuals

                            const percentLine = pipeline.results.find((line) => /closed\s+within\s+365/i.test(line))
                            const percentMatch = percentLine?.match(/(\d+(?:\.\d+)?)\s*%/)
                            const closedPct = percentMatch ? Number(percentMatch[1]) : 0
                            const closedPctSafe = Number.isFinite(closedPct) ? Math.max(0, Math.min(100, closedPct)) : 0

                            return [
                              { label: 'Closed within 365 days', value: closedPctSafe },
                              { label: 'Remaining', value: Math.max(100 - closedPctSafe, 0) },
                            ]
                          })()}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={82}
                          paddingAngle={2}
                        >
                          {(() => {
                            const hasVisualValues = reintegrationDonutDataFromVisuals.some((d) => d.value > 0)
                            const pieData = hasVisualValues
                              ? reintegrationDonutDataFromVisuals
                              : [
                                  { label: 'Closed within 365 days', value: 0 },
                                  { label: 'Remaining', value: 100 },
                                ]
                            return pieData.map((entry) => (
                              <Cell key={entry.label} fill={entry.label.includes('Closed') ? '#059669' : '#94a3b8'} />
                            ))
                          })()}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'Resident Risk Escalation' && data.pipelineVisuals?.residentRiskEscalation?.escalationSignalCounts && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(() => {
                          const base = residentEscalationGroupedData[0]
                          const parseNumberFromResult = (matcher: RegExp) => {
                            const line = pipeline.results.find((entry) => matcher.test(entry.toLowerCase()))
                            const match = line?.match(/(\d+(?:\.\d+)?)/)
                            return match ? Number(match[1]) : null
                          }

                          const concernsFromResults = parseNumberFromResult(/concern/)
                          const severeFromResults = parseNumberFromResult(/severe/)
                          const totalFromResults = parseNumberFromResult(/total|overall|residents?\s+flagged/)

                          const concernsFlagged = concernsFromResults ?? base.concernsFlagged
                          const severeIncidents = severeFromResults ?? base.severeIncidents
                          const totalFlagged =
                            totalFromResults ??
                            (base.totalFlagged > 0
                              ? base.totalFlagged
                              : Math.max(concernsFlagged + severeIncidents, concernsFlagged, severeIncidents))

                          return [{ group: 'Escalation Categories', concernsFlagged, severeIncidents, totalFlagged }]
                        })()}
                        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="group" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="concernsFlagged" name="Concerns Flagged" fill="#f59e0b" />
                        <Bar dataKey="severeIncidents" name="Severe Incidents" fill="#dc2626" />
                        <Bar dataKey="totalFlagged" name="Total Flagged" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'Social Content Donation Impact' && data.pipelineVisuals?.socialContentDonationImpact?.donationImpactSummary && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={socialPlatformDonationsData}
                        layout="vertical"
                        margin={{ top: 8, right: 16, left: 24, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="platform" width={130} />
                        <Tooltip />
                        <Bar dataKey="totalDonations" name="Total Donations" fill="#ea580c" />
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
