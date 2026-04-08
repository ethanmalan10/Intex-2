import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import PublicLayout from './components/layout/PublicLayout'

type Kpi = {
  label: string
  value: number
  prefix?: string
  suffix?: string
  whyItMatters: string
}

type TrendPoint = {
  month: string
  reintegrations: number
}

type AllocationPoint = {
  name: string
  value: number
}

type ProgressPoint = {
  area: string
  value: number
  description: string
}

type DashboardData = {
  updatedAt: string
  anonymization: {
    minGroupSize: number
    roundingBase: number
  }
  kpis: Kpi[]
  monthlyReintegrations: TrendPoint[]
  allocation: AllocationPoint[]
  progressIndicators: ProgressPoint[]
}

const DONUT_COLORS = ['#0f766e', '#14b8a6', '#5eead4', '#99f6e4', '#bfdbfe']
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

const FALLBACK_DATA: DashboardData = {
  updatedAt: '2026-04-07',
  anonymization: { minGroupSize: 5, roundingBase: 5 },
  kpis: [
    { label: 'Girls served this year', value: 190, whyItMatters: 'Shows how many lives received direct support.' },
    { label: 'Successful reintegrations', value: 125, whyItMatters: 'Represents stable transitions back to family or community.' },
    { label: 'Counseling sessions', value: 915, whyItMatters: 'Captures mental health support volume across programs.' },
    { label: 'Active safehouses', value: 6, whyItMatters: 'Indicates current shelter capacity.' },
    { label: 'Volunteer hours', value: 1340, whyItMatters: 'Tracks community contribution to operations.' },
    { label: 'Monthly donations', value: 42500, prefix: '$', whyItMatters: 'Supports planning for care, staffing, and supplies.' },
  ],
  monthlyReintegrations: [
    { month: 'Jan', reintegrations: 8 }, { month: 'Feb', reintegrations: 11 }, { month: 'Mar', reintegrations: 7 },
    { month: 'Apr', reintegrations: 13 }, { month: 'May', reintegrations: 10 }, { month: 'Jun', reintegrations: 9 },
    { month: 'Jul', reintegrations: 14 }, { month: 'Aug', reintegrations: 12 }, { month: 'Sep', reintegrations: 10 },
    { month: 'Oct', reintegrations: 15 }, { month: 'Nov', reintegrations: 11 }, { month: 'Dec', reintegrations: 5 },
  ],
  allocation: [
    { name: 'Education', value: 35 },
    { name: 'Wellbeing', value: 30 },
    { name: 'Operations', value: 20 },
    { name: 'Outreach', value: 15 },
  ],
  progressIndicators: [
    { area: 'Education Progress', value: 78, description: 'Residents reaching targeted education milestone bands.' },
    { area: 'Wellbeing Improvement', value: 72, description: 'Residents with improved wellbeing score trends.' },
    { area: 'Reintegration Readiness', value: 69, description: 'Residents in readiness bands for next-step planning.' },
  ],
}

function roundToBase(value: number, base: number) {
  return Math.round(value / base) * base
}

function sanitizeDashboardData(data: DashboardData): DashboardData {
  const minGroup = data.anonymization.minGroupSize
  const roundBase = data.anonymization.roundingBase

  const safeKpis = data.kpis.map((kpi) => ({
    ...kpi,
    value: roundToBase(Math.max(0, kpi.value), roundBase),
  }))

  const safeTrend = data.monthlyReintegrations.map((p) => ({
    ...p,
    reintegrations: p.reintegrations < minGroup ? 0 : roundToBase(p.reintegrations, roundBase),
  }))

  const safeProgress = data.progressIndicators.map((p) => ({
    ...p,
    value: Math.max(0, Math.min(100, p.value)),
  }))

  return {
    ...data,
    kpis: safeKpis,
    monthlyReintegrations: safeTrend,
    progressIndicators: safeProgress,
    allocation: data.allocation.filter((a) => a.value > 0),
  }
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-label={kpi.label}>
      <p className="text-sm font-medium text-stone-500">{kpi.label}</p>
      <p className="mt-2 text-3xl font-bold text-teal-700 tabular-nums">
        {kpi.prefix}{kpi.value.toLocaleString()}{kpi.suffix}
      </p>
      <p className="mt-2 text-xs text-stone-500">{kpi.whyItMatters}</p>
    </article>
  )
}

export default function ImpactDashboardPage() {
  const [rawData, setRawData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const endpoint = `${API_BASE_URL}/api/impact-dashboard`
    fetch(endpoint)
      .then(async (r) => {
        if (r.ok) return r.json()
        const body = await r.text()
        throw new Error(`HTTP ${r.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((json: DashboardData) => {
        setRawData(json)
        setIsLoading(false)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Live API unavailable (${msg}). Showing fallback data.`)
        setRawData(FALLBACK_DATA)
        setIsLoading(false)
      })
  }, [])

  const data = useMemo(() => sanitizeDashboardData(rawData ?? FALLBACK_DATA), [rawData])

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-stone-900">Impact Dashboard</h1>
        <p className="mt-3 max-w-3xl text-stone-600">
          Public, aggregated metrics showing outcomes, progress, and resource use. No resident- or donor-identifiable records are displayed.
        </p>
        <p className="mt-2 text-sm text-stone-500">Last updated: {isLoading && !rawData ? 'Loading...' : data.updatedAt}</p>
        {loadError ? <p className="mt-2 text-sm text-amber-700">{loadError}</p> : null}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="mb-4 text-xl font-semibold text-stone-900">Key Impact Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && !rawData
            ? Array.from({ length: 6 }).map((_, i) => <KpiCard key={`loading-${i}`} kpi={{ label: 'Loading...', value: 0, whyItMatters: 'Fetching live data.' }} />)
            : data.kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" aria-labelledby="trend-heading">
          <h3 id="trend-heading" className="text-lg font-semibold text-stone-900">Monthly Reintegrations</h3>
          <p className="mt-1 text-sm text-stone-500">Tracks monthly successful transitions to stable environments.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyReintegrations}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="reintegrations" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-stone-500">Why it matters: this trend indicates program throughput and reintegration consistency over time.</p>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" aria-labelledby="allocation-heading">
          <h3 id="allocation-heading" className="text-lg font-semibold text-stone-900">Resource Allocation</h3>
          <p className="mt-1 text-sm text-stone-500">Shows how donor funding is distributed across core program areas.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.allocation} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                  {data.allocation.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-stone-500">Why it matters: donors can see that funds are balanced across direct care and operations.</p>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10" aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="mb-4 text-xl font-semibold text-stone-900">Program Progress Indicators</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data.progressIndicators.map((p) => (
            <article key={p.area} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-stone-800">{p.area}</h3>
              <p className="mt-2 text-2xl font-bold text-teal-700">{p.value}%</p>
              <div className="mt-2 h-2 w-full rounded-full bg-stone-200">
                <div className="h-2 rounded-full bg-teal-600" style={{ width: `${p.value}%` }} />
              </div>
              <p className="mt-2 text-xs text-stone-500">{p.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12" aria-labelledby="table-heading">
        <h2 id="table-heading" className="mb-3 text-lg font-semibold text-stone-900">Text Alternative</h2>
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-700">
                <th className="py-2 pr-4">Metric</th>
                <th className="py-2 pr-4">Value</th>
                <th className="py-2">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {data.kpis.map((kpi) => (
                <tr key={kpi.label} className="border-b border-stone-100">
                  <td className="py-2 pr-4">{kpi.label}</td>
                  <td className="py-2 pr-4">{kpi.prefix}{kpi.value.toLocaleString()}{kpi.suffix}</td>
                  <td className="py-2">{kpi.whyItMatters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-stone-600">
          <p>
            Transparency note: All dashboard values are aggregated and anonymized with suppression for groups smaller than
            {' '}<strong>{data.anonymization.minGroupSize}</strong>. Selected metrics are rounded to protect privacy.
          </p>
          <p className="mt-2">
            Methodology: values are compiled from program systems and published as donor-facing operational summaries.
          </p>
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}
