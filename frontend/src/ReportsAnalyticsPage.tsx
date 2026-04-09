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
import { getAuthToken } from './utils/authToken'

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
      sessionBucketReadiness?: Array<{ label: string; value: number }>
    }
    donorRecurrenceForecast?: {
      topLikelyDonorScores: Array<{ name: string; score: number }>
    }
    reintegrationReadiness?: {
      readinessOverview: Array<{ label: string; value: number }>
      readinessByReintegrationType?: Array<{ label: string; value: number }>
    }
    residentRiskEscalation?: {
      escalationSignalCounts: Array<{ label: string; value: number }>
    }
    socialContentDonationImpact?: {
      donationImpactSummary: Array<{ label: string; value: number }>
    }
    socialPostConversionClassifier?: {
      postTypeConversionRates: Array<{ label: string; value: number }>
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
const CHART_COLORS = {
  primary: '#0f766e',
  secondary: '#14b8a6',
  tertiary: '#5eead4',
  quaternary: '#2dd4bf',
  muted: '#94a3b8',
}

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
  const token = getAuthToken()

  useEffect(() => {
    fetch(apiUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (res.ok) return res.json()
        throw new Error(`Request failed (HTTP ${res.status}).`)
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
  const residentEscalationCategoryData = (() => {
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

    return [
      { category: 'Concerns Flagged', value: concernsFlagged },
      { category: 'Severe Incidents', value: severeIncidents },
      { category: 'Total Flagged', value: totalFlagged },
    ]
  })()
  const reintegrationByTypeData = (() => {
    const byType = data.pipelineVisuals?.reintegrationReadiness?.readinessByReintegrationType ?? []
    return [...byType].sort((a, b) => b.value - a.value)
  })()
  const donorTopTenChartData = (() => {
    const scores = data.pipelineVisuals?.donorRecurrenceForecast?.topLikelyDonorScores ?? []
    return [...scores].sort((a, b) => b.score - a.score).slice(0, 10)
  })()
  const counselingSessionBucketData = (() => {
    const buckets = data.pipelineVisuals?.counselingIntensityReadinessEffect?.sessionBucketReadiness ?? []
    return [...buckets]
  })()
  const inactiveSupporterRiskPieData = (() => {
    const counts = data.pipelineVisuals?.inactiveSupporterRisk?.riskBandCounts ?? []
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

    const high = counts.find((item) => normalize(item.label).includes('high'))?.value ?? 0
    const medium = counts.find((item) => normalize(item.label).includes('medium'))?.value ?? 0
    const low = counts.find((item) => normalize(item.label).includes('low'))?.value ?? 0

    return [
      { label: 'High', value: high, color: CHART_COLORS.primary, order: 1 },
      { label: 'Medium', value: medium, color: CHART_COLORS.secondary, order: 2 },
      { label: 'Low', value: low, color: CHART_COLORS.tertiary, order: 3 },
    ].sort((a, b) => a.order - b.order)
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
  const socialPostTypeConversionData = (() => {
    const summary = data.pipelineVisuals?.socialPostConversionClassifier?.postTypeConversionRates ?? []
    return [...summary].sort((a, b) => b.value - a.value)
  })()
  const formatPipelineDisplayName = (name: string) =>
    name
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold text-teal-800">Reports & Analytics</h1>
          <p className="mt-2 text-stone-600">
            Pipeline-level reporting for decision support, monitoring, and operational planning.
          </p>
          <p className="mt-2 text-sm text-stone-500">Updated: {new Date(data.generatedAtUtc).toLocaleString()}</p>
          {loadError && <p className="mt-2 text-sm text-amber-700">{loadError}</p>}
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="mb-3 text-lg font-semibold text-teal-800">Pipeline Results by Use Case</h2>
          <div className="space-y-4">
            {data.pipelineResults.map((pipeline) => (
              <article key={pipeline.name} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="mt-1 font-semibold text-teal-700">{formatPipelineDisplayName(pipeline.name)}</p>
                <p className="mt-2 text-sm text-stone-700"><strong>Business problem:</strong> {pipeline.businessProblem}</p>
                <p className="mt-2 text-sm text-stone-600">
                  <strong>Status:</strong>{' '}
                  <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
                    {pipeline.runStatus}
                  </span>
                </p>
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
                {pipeline.name === 'inactive_supporter_risk' && data.pipelineVisuals?.inactiveSupporterRisk?.riskBandCounts && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
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
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-600">
                      {inactiveSupporterRiskPieData.map((entry) => (
                        <span key={entry.label} className="inline-flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                          {entry.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pipeline.name === 'counseling-intensity-readiness-effect' && data.pipelineVisuals?.counselingIntensityReadinessEffect?.sessionBucketReadiness && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={counselingSessionBucketData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="value" name="Readiness Rate (%)" fill={CHART_COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'donor-recurrence-forecast' && data.pipelineVisuals?.donorRecurrenceForecast?.topLikelyDonorScores && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={donorTopTenChartData} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis type="category" dataKey="name" width={110} />
                        <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Likelihood Score']} />
                        <Bar dataKey="score" fill={CHART_COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'reintegration-readiness' && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reintegrationByTypeData} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="label" width={140} />
                        <Tooltip />
                        <Bar dataKey="value" name="Readiness Rate (%)" fill={CHART_COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'resident-risk-escalation' && data.pipelineVisuals?.residentRiskEscalation?.escalationSignalCounts && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(() => {
                          const baseValues = Object.fromEntries(
                            residentEscalationCategoryData.map((item) => [item.category, item.value])
                          ) as Record<string, number>
                          const parseNumberFromResult = (matcher: RegExp) => {
                            const line = pipeline.results.find((entry) => matcher.test(entry.toLowerCase()))
                            if (!line) return null
                            const afterColon = line.split(':').pop()?.match(/(\d+(?:\.\d+)?)/)
                            if (afterColon) return Number(afterColon[1])
                            const allMatches = [...line.matchAll(/(\d+(?:\.\d+)?)/g)]
                            if (allMatches.length === 0) return null
                            return Number(allMatches[allMatches.length - 1][1])
                          }

                          const concernsFromResults = parseNumberFromResult(/concern/)
                          const severeFromResults = parseNumberFromResult(/severe/)
                          const totalFromResults = parseNumberFromResult(/total|overall|residents?\s+flagged/)

                          const concernsFlagged = concernsFromResults ?? baseValues['Concerns Flagged'] ?? 0
                          const severeIncidents = severeFromResults ?? baseValues['Severe Incidents'] ?? 0
                          const totalFlagged =
                            totalFromResults ??
                            ((baseValues['Total Flagged'] ?? 0) > 0
                              ? (baseValues['Total Flagged'] ?? 0)
                              : Math.max(concernsFlagged + severeIncidents, concernsFlagged, severeIncidents))

                          return [
                            { category: 'Concerns Flagged', value: concernsFlagged },
                            { category: 'Severe Incidents', value: severeIncidents },
                            { category: 'Total Flagged', value: totalFlagged },
                          ]
                        })()}
                        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Residents" fill={CHART_COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'social-content-donation-impact' && data.pipelineVisuals?.socialContentDonationImpact?.donationImpactSummary && (
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
                        <Bar dataKey="totalDonations" name="Total Donations" fill={CHART_COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pipeline.name === 'social-post-conversion-classifier' && data.pipelineVisuals?.socialPostConversionClassifier?.postTypeConversionRates && (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={socialPostTypeConversionData}
                        layout="vertical"
                        margin={{ top: 8, right: 16, left: 24, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="label" width={140} />
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Conversion Rate']} />
                        <Bar dataKey="value" name="Conversion Rate (%)" fill={CHART_COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>
            ))}
            {data.pipelineResults.length === 0 && (
              <article className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-stone-600">No pipeline results available yet. Add or refresh source data, then reload this page.</p>
              </article>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
