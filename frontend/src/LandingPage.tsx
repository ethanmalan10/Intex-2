import { CSSProperties, useEffect, useRef, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import PublicLayout from './components/layout/PublicLayout'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

type LandingChartPoint = {
  month: string
  reintegrations: number
}

type LandingAllocationPoint = {
  name: string
  value: number
}

type LandingApiData = {
  hero: {
    girlsCurrentlyInCare: number
    successfulReintegrationsToDate: number
    activeSafehouses: number
  }
  impact: {
    girlsCurrentlyInCare: number
    successfulReintegrations: number
    activeSafehouses: number
    counselingSessionsThisMonth: number
    volunteerHoursThisMonth: number | null
    monthlyDonations: number
    monthlyReintegrations: LandingChartPoint[]
    donationBreakdown: LandingAllocationPoint[]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll animation hook
// ─────────────────────────────────────────────────────────────────────────────
function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Fade({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
}) {
  const { ref, visible } = useFadeIn(threshold)
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        ${className}`}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat counter animation
// ─────────────────────────────────────────────────────────────────────────────
function useCounter(target: number | null, duration = 1800) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true) },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started || target === null) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { ref, value }
}

function AnimatedStat({
  target,
  prefix = '',
  suffix = '',
  label,
  delay = 0,
}: {
  target: number | null
  prefix?: string
  suffix?: string
  label: string
  delay?: number
}) {
  const { ref, value } = useCounter(target, 1600)
  return (
    <div ref={ref} className="text-center" style={{ transitionDelay: `${delay}ms` }}>
      <p className="text-4xl sm:text-5xl font-bold text-teal-700 tabular-nums">
        {target === null ? '…' : `${prefix}${value.toLocaleString()}${suffix}`}
      </p>
      <p className="text-stone-500 text-sm mt-2 leading-snug">{label}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Person icon
// ─────────────────────────────────────────────────────────────────────────────
function PersonIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4
               7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6
               1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing chart colors
// ─────────────────────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#5f8c6e', '#7fada0', '#a3c4b5', '#c9ddd5']

// ─────────────────────────────────────────────────────────────────────────────
// Hero — full bleed photo, strong mission statement, clear CTA
// ─────────────────────────────────────────────────────────────────────────────
function Hero({ heroData, isLoading, hasError }: {
  heroData: { girlsCurrentlyInCare: number; successfulReintegrationsToDate: number; activeSafehouses: number } | null
  isLoading: boolean
  hasError: boolean
}) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: 'url(/hero.jpg)', filter: 'brightness(0.95)' }}
      />
      {/* Keep text readable with a lighter overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/35 via-stone-900/25 to-stone-900/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-white/80 text-xs tracking-widest uppercase font-medium">Brazil · Active Program</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Every girl<br />deserves a<br />
            <span className="text-amber-400">safe place</span><br />
            to heal.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-md">
            BrighterPath provides safehouses, rehabilitation, and reintegration for girls
            who are survivors of sexual abuse and trafficking in Brazil.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/donate"
              className="px-8 py-3.5 rounded-full bg-teal-500 text-white font-bold hover:bg-teal-400 transition-colors shadow-lg shadow-teal-900/40">
              Donate Now
            </a>
            <a href="/impact-dashboard"
              className="px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors backdrop-blur">
              See Our Impact
            </a>
          </div>
        </div>

        {/* Right — trust signals */}
        <div className="hidden md:flex flex-col gap-4">
          {[
            { n: heroData?.girlsCurrentlyInCare?.toString() ?? '…', label: 'Girls currently in our care' },
            { n: heroData?.successfulReintegrationsToDate?.toString() ?? '…', label: 'Successful reintegrations to date' },
            { n: heroData?.activeSafehouses?.toString() ?? '…', label: 'Active safehouses across Brazil' },
          ].map((s, i) => (
            <div key={i}
              className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-6 py-5 flex items-center gap-5"
              style={{ animationDelay: `${i * 150}ms` }}>
              <span className="text-4xl font-bold text-teal-400">
                {isLoading ? '...' : hasError || s.n == null ? 'N/A' : s.n.toLocaleString()}
              </span>
              <span className="text-white/80 text-sm leading-snug">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Reality section — the 80% statistic graphic
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL = 4
const STAGGER = 550

function IconGrid({ phase }: { phase: number }) {
  return (
    <div className="flex gap-4 sm:gap-6 justify-center">
      {Array.from({ length: TOTAL }).map((_, i) => {
        const isPartial = i === 3
        const delay = phase >= 1 ? i * STAGGER : 0
        return (
          <div key={i} className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20">
            {/* Grey base always visible */}
            <PersonIcon className="absolute inset-0 w-full h-full text-stone-300" />
            {/* Teal overlay fades in with stagger; partial icon clips to 80% */}
            <PersonIcon
              className="absolute inset-0 w-full h-full transition-opacity duration-500"
              style={{
                color: '#FBBF24',
                clipPath: isPartial ? 'inset(0 80% 0 0)' : undefined,
                transitionDelay: `${delay}ms`,
                opacity: phase >= 1 ? 1 : 0,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

function RealitySection() {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    let fired = false
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) {
        fired = true
        setPhase(1)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="bg-white py-28 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 text-center">

        <Fade>
          <p className="text-teal-600 uppercase tracking-widest text-xs font-semibold mb-4">The Reality in Brazil</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight">
            This problem is<br />bigger than it looks.
          </h2>
        </Fade>

        {/* Stat */}
        <Fade className="w-full">
          <div className="flex flex-col items-center gap-2">
            <p className="text-7xl sm:text-8xl font-bold text-teal-400 leading-none">80%</p>
            <p className="text-stone-700 text-xl sm:text-2xl font-medium">
              of child sexual abuse in Brazil happens<br />at home, by a family member.
            </p>
            <p className="text-stone-400 text-xs mt-1">Brazil Ministry of Human Rights, 2023</p>
          </div>
        </Fade>

        {/* Icon grid */}
        <div ref={triggerRef}>
          <IconGrid phase={phase} />
        </div>

        <Fade>
          <div className="mt-4 max-w-xl">
            <p className="text-stone-400 text-base leading-relaxed">
              These are not distant statistics. They are daughters, sisters, neighbors.
              BrighterPath exists because someone has to show up for them.
            </p>
          </div>
        </Fade>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Impact dashboard
// ─────────────────────────────────────────────────────────────────────────────
function ImpactDashboard({
  impactData,
  isLoading,
  hasError,
}: {
  impactData: LandingApiData['impact'] | null
  isLoading: boolean
  hasError: boolean
}) {
  const monthlyData = impactData?.monthlyReintegrations ?? []
  const donationBreakdown = (impactData?.donationBreakdown ?? [])
    .slice()
    .sort((a, b) => b.value - a.value)

  return (
    <section
      id="our-impact"
      className="relative py-24 px-6"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/girlsongrass.jpeg')",
          filter: 'brightness(1.05) contrast(1.1) saturate(1.14)',
        }}
      />
      <div className="absolute inset-0 bg-white/76" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <Fade className="text-center mb-14">
          <p className="text-teal-600 uppercase tracking-widest text-xs font-semibold mb-3">Proof of Impact</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-3">Your donations at work</h2>
          <p className="text-stone-500 max-w-xl mx-auto text-base">
            We believe donors deserve to see exactly where their support goes. Every metric below is real, aggregated, and anonymized.
          </p>
          {hasError ? (
            <p className="mt-2 text-sm text-amber-700">
              Live landing metrics are temporarily unavailable.
            </p>
          ) : null}
        </Fade>

        {/* Animated counters */}
        <Fade className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {isLoading || !impactData ? (
            <>
              <AnimatedStat target={0} label="Girls currently in care" />
              <AnimatedStat target={0} label="Successful reintegrations" />
              <AnimatedStat target={0} label="Active safehouses" />
            </>
          ) : (
            <>
              <AnimatedStat target={impactData.girlsCurrentlyInCare} label="Girls currently in care" />
              <AnimatedStat target={impactData.successfulReintegrations} label="Successful reintegrations" />
              <AnimatedStat target={impactData.activeSafehouses} label="Active safehouses" />
            </>
          )}
        </Fade>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Bar chart */}
          <Fade className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <h3 className="text-stone-700 font-semibold text-base mb-1">Monthly Reintegrations</h3>
            <p className="text-stone-400 text-xs mb-6">Girls returned to safe, stable lives — this year</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  cursor={{ fill: '#f0fdf4' }}
                />
                <Bar dataKey="reintegrations" fill="#5f8c6e" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Fade>

          {/* Donut chart */}
          <Fade className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100" delay={150}>
            <h3 className="text-stone-700 font-semibold text-base mb-1">Donation Breakdown</h3>
            <p className="text-stone-400 text-xs mb-6">How every dollar is allocated by program area</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donationBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                  {donationBreakdown.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#78716c' }} />
              </PieChart>
            </ResponsiveContainer>
          </Fade>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Meet Ana
// ─────────────────────────────────────────────────────────────────────────────
function MeetAna() {
  return (
    <section id="our-story" className="py-24 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        <Fade className="text-center mb-14">
          <p className="text-teal-600 uppercase tracking-widest text-xs font-semibold mb-3">A Story of Hope</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800">Meet Ana</h2>
        </Fade>

        <Fade>
          <div className="bg-gradient-to-br from-stone-50 to-teal-50 rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col md:flex-row">
            <div className="md:w-2/5 h-80 md:h-auto relative">
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&crop=face"
                alt="Ana, a program graduate"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="md:w-3/5 p-10 sm:p-12 flex flex-col justify-center gap-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-teal-400" />
                <span className="text-teal-600 text-xs uppercase tracking-widest font-semibold">Success Story #124</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-stone-800">
                Ana*
                <span className="text-stone-400 text-base font-normal ml-2">(name changed for privacy)</span>
              </h3>
              <p className="text-stone-400 text-sm">Admitted at 14 · Now 19</p>
              <p className="text-stone-600 leading-relaxed text-base">
                Ana came to BrighterPath at 14 after being referred by a local NGO. During her time in our safehouse
                she completed her secondary education and discovered a passion for graphic design. Today she runs a
                small freelance design business and volunteers mentoring younger girls in our program.
              </p>
              <blockquote className="border-l-4 border-teal-400 pl-6 py-1">
                <p className="italic text-stone-700 text-xl leading-snug">"I finally felt like someone believed in me."</p>
              </blockquote>
              <div className="pt-2 flex flex-wrap gap-4">
                <a href="/donate"
                  className="px-7 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-sm">
                  Donate in Ana's Honor
                </a>
                <a href="/impact-dashboard"
                  className="px-7 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-semibold hover:border-teal-400 hover:text-teal-600 transition-colors">
                  See All Impact
                </a>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Help
// ─────────────────────────────────────────────────────────────────────────────
function GetHelp() {
  return (
    <section id="get-help" className="py-24 bg-teal-900 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <Fade>
          <p className="text-teal-400 uppercase tracking-widest text-xs font-semibold mb-4">Confidential Support</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Are you in danger?<br />You are not alone.
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-14 leading-relaxed">
            If you are a girl in Brazil who needs safety, someone to talk to, or a way out —
            every option below is free and completely confidential.
          </p>
        </Fade>

        <Fade>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {/* WhatsApp */}
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-lg">WhatsApp</h3>
              <p className="text-white/50 text-sm leading-relaxed">Message us confidentially, anytime.</p>
              <a href="https://wa.me/5511999999999" className="text-teal-400 font-medium text-sm hover:underline">+55 11 99999-9999</a>
            </div>

            {/* Disque 100 */}
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-lg">Disque 100</h3>
              <p className="text-white/50 text-sm leading-relaxed text-center">Brazil's national hotline. Free and confidential.</p>
              <span className="text-teal-400 font-bold text-3xl">100</span>
            </div>

            {/* Online Form */}
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-lg">Secure Form</h3>
              <p className="text-white/50 text-sm leading-relaxed">Fill out our safe contact form at your own pace.</p>
              <button className="mt-1 px-5 py-2 rounded-full bg-amber-400 text-stone-900 text-sm font-semibold hover:bg-amber-300 transition-colors">
                Open Form
              </button>
            </div>
          </div>
        </Fade>

        <Fade>
          <p className="text-white/30 text-xs">Your safety is our priority. All contacts are strictly confidential.</p>
        </Fade>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Donate CTA
// ─────────────────────────────────────────────────────────────────────────────
function DonateCTA() {
  return (
    <section id="donate" className="py-24 bg-gradient-to-br from-teal-600 to-teal-800 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Fade>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Be the reason a girl finds safety.
          </h2>
          <p className="text-teal-100/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Every donation — no matter the size — funds a bed in a safehouse, a counseling session,
            or one more step toward a girl's future.
          </p>
          <a href="/donate"
            className="inline-block px-10 py-4 rounded-full bg-white text-teal-700 font-bold text-lg hover:bg-teal-50 transition-colors shadow-xl shadow-teal-900/30">
            Donate Securely
          </a>
          <p className="text-teal-100/50 text-xs mt-6">
            BrighterPath is a registered nonprofit. All donations are tax-deductible where applicable.
          </p>
        </Fade>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [landingData, setLandingData] = useState<LandingApiData | null>(null)
  const [isLoadingLanding, setIsLoadingLanding] = useState(true)
  const [landingError, setLandingError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/landing`)
      .then(async (res) => {
        if (res.ok) return res.json()
        throw new Error(`Request failed (HTTP ${res.status}).`)
      })
      .then((json: LandingApiData) => {
        setLandingData(json)
        setIsLoadingLanding(false)
        setLandingError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLandingError(msg)
        setIsLoadingLanding(false)
      })
  }, [])

  return (
    <PublicLayout navVariant="landing" offsetTop={false}>
      <Hero
        heroData={landingData?.hero ?? null}
        isLoading={isLoadingLanding}
        hasError={!!landingError}
      />
      <RealitySection />
      <ImpactDashboard
        impactData={landingData?.impact ?? null}
        isLoading={isLoadingLanding}
        hasError={!!landingError}
      />
      <MeetAna />
      <GetHelp />
      <DonateCTA />
    </PublicLayout>
  )
}
