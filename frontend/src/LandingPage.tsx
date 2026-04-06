import { useEffect, useRef, useState } from 'react'

// ── Scroll fade-in hook ──────────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useFadeIn()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  )
}

// ── Two-phase graphic ─────────────────────────────────────────────────────────
//
//  Phase 0 → all icons muted stone (before scrolled into view)
//  Phase 1 → 3 icons light up teal, one by one (1 in 4)
//  Phase 2 → 1 of those 3 transitions to amber with a pulse (1 in 3 knew abuser)
//
const TOTAL = 12                      // 4 × 3 grid
const ABUSED_INDICES = [0, 1, 2]      // first three icons in the grid
const KNEW_ABUSER_INDEX = 0           // first of those three → amber in phase 2
const STAGGER_MS = 600                // ms between each teal reveal
const PHASE2_DELAY_MS =
  (ABUSED_INDICES.length - 1) * STAGGER_MS + 1800  // after last teal + pause

function PersonSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4
               7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6
               1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  )
}

function TwoPhaseGraphic() {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let fired = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          fired = true
          setPhase(1)
          setTimeout(() => setPhase(2), PHASE2_DELAY_MS)
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-col items-center gap-10">

      {/* Icon grid */}
      <div className="grid grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: TOTAL }).map((_, i) => {
          const isAbused = ABUSED_INDICES.includes(i)
          const isKnew   = i === KNEW_ABUSER_INDEX
          const order    = ABUSED_INDICES.indexOf(i) // -1 if not abused

          // colour logic
          let color = 'text-stone-200'
          if (isKnew && phase >= 2)         color = 'text-amber-400'
          else if (isAbused && phase >= 1)  color = 'text-teal-500'

          // per-icon transition delay only for abused icons during phase 1
          const delayMs = isAbused && phase >= 1 ? order * STAGGER_MS : 0

          return (
            <div key={i} className="relative flex items-center justify-center">
              {/* Amber pulse ring — visible only on phase 2 for knew-abuser icon */}
              {isKnew && (
                <span
                  className={`absolute inset-0 rounded-full transition-opacity duration-500
                    ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)',
                    animation: phase >= 2 ? 'ping-soft 1.8s ease-out' : 'none',
                  }}
                />
              )}
              <PersonSVG
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 transition-colors transition-transform duration-500
                  ${isKnew && phase >= 2 ? 'scale-115' : 'scale-100'} ${color}`}
                style={{ transitionDelay: `${delayMs}ms` }}
              />
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-center mt-4">
        {/* Phase 1 label */}
        <div
          className={`flex items-start gap-3 transition-all duration-700
            ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
          style={{ transitionDelay: phase >= 1 ? `${STAGGER_MS * 2}ms` : '0ms' }}
        >
          <span className="mt-1.5 w-4 h-4 rounded-full bg-teal-500 flex-shrink-0" />
          <div>
            <p className="text-stone-800 font-semibold text-base sm:text-lg">1 in 4 girls</p>
            <p className="text-stone-500 text-sm sm:text-base leading-snug max-w-[240px]">
              experiences sexual violence before the age of 18
            </p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-10 bg-stone-200" />

        {/* Phase 2 label */}
        <div
          className={`flex items-start gap-3 transition-all duration-700
            ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        >
          <span className="mt-1.5 w-4 h-4 rounded-full bg-amber-400 flex-shrink-0" />
          <div>
            <p className="text-stone-800 font-semibold text-base sm:text-lg">of those, 1 in 3</p>
            <p className="text-stone-500 text-sm sm:text-base leading-snug max-w-[240px]">
              knew their abuser — a family member or trusted adult
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Stats Hero ────────────────────────────────────────────────────────────────
function StatsHero() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-stone-50 to-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-14">

        {/* Headline */}
        <FadeSection className="text-center">
          <p className="text-teal-600 uppercase tracking-widest text-xs font-semibold mb-5">
            Brazil · The Reality
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight mb-5">
            This Is Happening.<br />Right Now. In Brazil.
          </h1>
          <p className="text-stone-500 text-lg max-w-xl mx-auto leading-relaxed">
            Sexual violence against girls is not rare. It is widespread, underreported, and largely invisible.
            These numbers represent real lives.
          </p>
        </FadeSection>

        {/* The graphic — triggers its own observer internally */}
        <TwoPhaseGraphic />

        {/* Supporting stat strip */}
        <FadeSection className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '180k+', label: 'Cases reported annually', sub: 'SINAN / Ministry of Health' },
              { value: '86%',   label: 'Victims are female',      sub: 'FBSP 2023' },
              { value: '13',    label: 'Average age at first abuse', sub: 'Childhood Brasil' },
              { value: '70%',   label: 'Abuse occurs inside the home', sub: 'UNICEF Brazil' },
            ].map(s => (
              <div key={s.value} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold text-teal-700 mb-1">{s.value}</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-snug mb-1">{s.label}</p>
                <p className="text-stone-400 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </FadeSection>

        {/* Bridge CTA */}
        <FadeSection className="text-center">
          <p className="text-stone-500 text-base leading-relaxed max-w-lg mx-auto mb-6">
            Circle Healing exists because these numbers are not inevitable.
            Every girl deserves safety, healing, and a future.
          </p>
          <a
            href="#help"
            className="inline-block px-8 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            Get Help Now
          </a>
        </FadeSection>

      </div>
    </section>
  )
}

// ── Get Help ─────────────────────────────────────────────────────────────────
function GetHelp() {
  return (
    <section id="help" className="py-24 bg-amber-50 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <FadeSection>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
            Are You in Danger?<br className="sm:hidden" /> We Can Help.
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
            Are you in danger — or do you know someone who needs support?
          </p>
          <p className="text-stone-500 text-base max-w-xl mx-auto mb-14 leading-relaxed">
            Reaching out is free, safe, and completely confidential. You don't have to face this alone.
          </p>
        </FadeSection>

        <FadeSection>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">

            {/* WhatsApp */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-800 text-lg">WhatsApp</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Message us confidentially, anytime.</p>
              <a href="https://wa.me/5511999999999" className="text-teal-700 font-medium text-sm mt-1 hover:underline">
                +55 11 99999-9999
              </a>
            </div>

            {/* Disque 100 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-800 text-lg">Disque 100</h3>
              <p className="text-stone-500 text-sm leading-relaxed text-center">
                Brazil's national hotline for children and adolescents. Free and confidential.
              </p>
              <span className="text-teal-700 font-bold text-2xl mt-1">100</span>
            </div>

            {/* Online Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-800 text-lg">Online Form</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Fill out our secure contact form at your own pace.</p>
              <button className="mt-1 px-5 py-2 rounded-full bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
                Open Form
              </button>
            </div>
          </div>
        </FadeSection>

        <FadeSection>
          <p className="text-stone-400 text-xs">Your safety is our priority. All contacts are confidential.</p>
        </FadeSection>
      </div>
    </section>
  )
}

// ── Survivor Story ────────────────────────────────────────────────────────────
function SurvivorStory() {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        <FadeSection>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 text-center mb-14">Meet Ana</h2>
        </FadeSection>

        <FadeSection>
          <div className="bg-gradient-to-br from-stone-50 to-teal-50 rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col md:flex-row">
            <div className="md:w-2/5 h-72 md:h-auto">
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&crop=face"
                alt="Ana, a program graduate"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-3/5 p-10 flex flex-col justify-center gap-5">
              <span className="text-xs uppercase tracking-widest text-teal-600 font-semibold">A Story of Hope</span>
              <h3 className="text-2xl font-bold text-stone-800">
                Ana* <span className="text-stone-400 text-base font-normal">(name changed to protect privacy)</span>
              </h3>
              <p className="text-stone-500 text-sm">Admitted age 14 &nbsp;·&nbsp; Current age 19</p>
              <p className="text-stone-600 leading-relaxed">
                Ana came to Circle Healing at 14 after being referred by a local NGO. During her time in our safehouse
                she completed her secondary education and discovered a passion for graphic design. Today at 19 she runs
                a small freelance design business and volunteers mentoring younger girls in our program. Her story is
                one of 124 reintegrations Circle Healing has supported.
              </p>
              <blockquote className="border-l-4 border-teal-400 pl-5 italic text-stone-600 text-lg">
                "I finally felt like someone believed in me."
              </blockquote>
              <div className="pt-2">
                <button className="px-7 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-sm">
                  Donate in Ana's Honor
                </button>
              </div>
            </div>
          </div>
        </FadeSection>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 px-6 py-16">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-10">
        <div>
          <p className="text-xl font-semibold text-teal-700 mb-2">Circle Healing</p>
          <p className="text-stone-500 text-sm leading-relaxed">
            Restoring hope, one life at a time.<br />Safe homes, healing, and reintegration for survivors across Brazil.
          </p>
        </div>
        <div>
          <p className="font-semibold text-stone-700 mb-4 text-sm uppercase tracking-wider">Quick Links</p>
          <ul className="flex flex-col gap-2 text-stone-500 text-sm">
            {['Home', 'Our Impact', 'Get Help', 'Donate', 'Privacy Policy'].map(l => (
              <li key={l}><a href="#" className="hover:text-teal-700 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-stone-700 mb-4 text-sm uppercase tracking-wider">Contact</p>
          <ul className="flex flex-col gap-2 text-stone-500 text-sm">
            <li>contact@circlehealing.org</li>
            <li>+55 11 99999-9999</li>
            <li>São Paulo, Brazil</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-stone-200 text-center text-stone-400 text-xs leading-relaxed">
        Circle Healing is a registered nonprofit organization. All resident information is anonymized to protect privacy and safety.
      </div>
    </footer>
  )
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-semibold text-teal-700 tracking-wide">Circle Healing</span>
        <ul className="hidden md:flex items-center gap-8 text-sm text-stone-600 font-medium">
          {['Home', 'Our Impact', 'Get Help'].map(link => (
            <li key={link}>
              <a href="#" className="hover:text-teal-700 transition-colors">{link}</a>
            </li>
          ))}
          <li>
            <a href="#" className="px-5 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm">
              Donate
            </a>
          </li>
        </ul>
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-stone-600 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-stone-600 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-stone-600 transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 pb-4 flex flex-col gap-4 text-stone-600 text-sm font-medium">
          {['Home', 'Our Impact', 'Get Help'].map(link => (
            <a key={link} href="#" className="hover:text-teal-700 transition-colors">{link}</a>
          ))}
          <a href="#" className="self-start px-5 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors">
            Donate
          </a>
        </div>
      )}
    </nav>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-sans text-stone-700 antialiased">
      <Navbar />
      <StatsHero />
      <GetHelp />
      <SurvivorStory />
      <Footer />
    </div>
  )
}
