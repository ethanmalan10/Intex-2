import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import PublicLayout from './components/layout/PublicLayout'
import { getAuthToken } from './utils/authToken'

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

const DONUT_COLORS = ['#0f766e', '#14b8a6', '#5eead4', '#99f6e4', '#bfdbfe', '#7dd3c7']
const ALLOCATION_COLOR_BY_NAME: Record<string, string> = {
  outreach: '#2a9d8f',
  transport: '#0f766e',
}
const HIDDEN_KPI_LABELS = new Set(['Counseling sessions', 'Monthly donations', 'Donations this month', 'Volunteer hours'])
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function roundToBase(value: number, base: number) {
  return Math.round(value / base) * base
}

function sanitizeDashboardData(data: DashboardData): DashboardData {
  const roundBase = Math.max(1, data.anonymization.roundingBase)

  const safeKpis = data.kpis.map((kpi) => ({
    ...kpi,
    value: roundToBase(Math.max(0, kpi.value), roundBase),
  }))

  const safeTrend = data.monthlyReintegrations.map((p) => ({
    ...p,
    // Keep small monthly values visible so trend charts match operational dashboards.
    reintegrations: Math.max(0, roundToBase(p.reintegrations, roundBase)),
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

function getAllocationColor(name: string, index: number) {
  return ALLOCATION_COLOR_BY_NAME[name.trim().toLowerCase()] ?? DONUT_COLORS[index % DONUT_COLORS.length]
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" aria-label={kpi.label}>
      <p className="text-lg font-medium text-stone-500">{kpi.label}</p>
      <p className="mt-3 text-4xl font-bold text-teal-700 tabular-nums">
        {kpi.prefix}{kpi.value.toLocaleString()}{kpi.suffix}
      </p>
    </article>
  )
}

export default function ImpactDashboardPage() {
  const token = getAuthToken()
  const [rawData, setRawData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const endpoint = `${API_BASE_URL}/api/impact-dashboard`
    fetch(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (r) => {
        if (r.ok) return r.json()
        throw new Error(`Request failed (HTTP ${r.status}).`)
      })
      .then((json: DashboardData) => {
        setRawData(json)
        setIsLoading(false)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Live API unavailable (${msg}).`)
        setRawData(null)
        setIsLoading(false)
      })
  }, [])

  const data = useMemo(() => (rawData ? sanitizeDashboardData(rawData) : null), [rawData])
  const visibleKpis = useMemo(
    () => (data ? data.kpis.filter((kpi) => !HIDDEN_KPI_LABELS.has(kpi.label)) : []),
    [data]
  )

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold text-stone-900">Our Impact Dashboard</h1>
        <p className="mt-2 text-lg text-stone-500">Last updated: {isLoading ? 'Loading...' : data?.updatedAt ?? 'Unavailable'}</p>
        {loadError ? <p className="mt-2 text-lg text-amber-700">{loadError}</p> : null}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="mb-4 text-2xl font-semibold text-stone-900">Key Impact Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <KpiCard key={`loading-${i}`} kpi={{ label: 'Loading...', value: 0, whyItMatters: 'Fetching live data.' }} />)
            : visibleKpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" aria-labelledby="trend-heading">
          <h3 id="trend-heading" className="text-2xl font-semibold text-stone-900">Monthly Reintegrations</h3>
          <p className="mt-1 text-lg text-stone-500">Tracks monthly successful transitions to stable environments.</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyReintegrations ?? []}>
                <XAxis dataKey="month" tick={{ fontSize: 16 }} />
                <YAxis tick={{ fontSize: 16 }} />
                <Tooltip />
                <Bar dataKey="reintegrations" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" aria-labelledby="allocation-heading">
          <h3 id="allocation-heading" className="text-2xl font-semibold text-stone-900">Resource Allocation</h3>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.allocation ?? []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                  {(data?.allocation ?? []).map((slice, i) => <Cell key={i} fill={getAllocationColor(slice.name, i)} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10" aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="mb-4 text-2xl font-semibold text-stone-900">Program Progress Indicators</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(data?.progressIndicators ?? []).map((p) => (
            <article key={p.area} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-stone-800">{p.area}</h3>
              <p className="mt-2 text-3xl font-bold text-teal-700">{p.value}%</p>
              <div className="mt-4 h-2 w-full rounded-full bg-stone-200">
                <div className="h-2 rounded-full bg-teal-600" style={{ width: `${p.value}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

     
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-lg text-stone-600">
          <p>
            Transparency note: All dashboard values are aggregated and anonymized with suppression for groups smaller than
            {' '}<strong>{data?.anonymization.minGroupSize ?? 'N/A'}</strong>. Selected metrics are rounded to protect privacy.
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
