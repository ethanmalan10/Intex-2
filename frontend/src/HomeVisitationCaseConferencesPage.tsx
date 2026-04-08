import { FormEvent, useEffect, useMemo, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'

type Resident = {
  id: number
  name: string
}

type VisitType =
  | 'Initial Assessment'
  | 'Routine Follow-Up'
  | 'Reintegration Assessment'
  | 'Post-Placement Monitoring'
  | 'Emergency'

type CooperationLevel = 'Low' | 'Moderate' | 'High'

type HomeVisitEntry = {
  id: number
  residentId: number
  visitDate: string
  socialWorker: string
  visitType: VisitType
  observations: string
  familyCooperationLevel: CooperationLevel
  safetyConcerns: boolean
  followUpActions: string
}

type CaseConference = {
  id: number
  residentId: number
  conferenceDate: string
  topic: string
  status: 'Upcoming' | 'Completed'
  notes: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

type FormState = {
  visitDate: string
  socialWorker: string
  visitType: VisitType
  observations: string
  familyCooperationLevel: CooperationLevel
  safetyConcerns: boolean
  followUpActions: string
}

const RESIDENTS: Resident[] = [
  { id: 201, name: 'Resident A' },
  { id: 202, name: 'Resident B' },
  { id: 203, name: 'Resident C' },
]

const INITIAL_VISITS: HomeVisitEntry[] = [
  {
    id: 1,
    residentId: 201,
    visitDate: '2026-03-18',
    socialWorker: 'Dana James',
    visitType: 'Initial Assessment',
    observations: 'Home appears clean with stable utilities. Resident has private sleeping space.',
    familyCooperationLevel: 'Moderate',
    safetyConcerns: false,
    followUpActions: 'Schedule routine follow-up in 2 weeks and confirm school transport options.',
  },
  {
    id: 2,
    residentId: 201,
    visitDate: '2026-04-02',
    socialWorker: 'Dana James',
    visitType: 'Routine Follow-Up',
    observations: 'Caregiver engaged and asked for additional parenting support resources.',
    familyCooperationLevel: 'High',
    safetyConcerns: false,
    followUpActions: 'Share caregiver support group calendar and revisit adjustment progress next month.',
  },
  {
    id: 3,
    residentId: 202,
    visitDate: '2026-03-27',
    socialWorker: 'Chris Nguyen',
    visitType: 'Emergency',
    observations: 'Escalated conflict at home; resident temporarily relocated for safety.',
    familyCooperationLevel: 'Low',
    safetyConcerns: true,
    followUpActions: 'Open emergency case conference and coordinate immediate safety plan check-ins.',
  },
]

const INITIAL_CONFERENCES: CaseConference[] = [
  {
    id: 1,
    residentId: 201,
    conferenceDate: '2026-04-12',
    topic: 'Reintegration readiness checkpoint',
    status: 'Upcoming',
    notes: 'Review family support capacity and school attendance trend.',
  },
  {
    id: 2,
    residentId: 201,
    conferenceDate: '2026-03-10',
    topic: 'Initial multidisciplinary intake',
    status: 'Completed',
    notes: 'Agreed on 90-day stabilization goals and weekly counseling schedule.',
  },
  {
    id: 3,
    residentId: 202,
    conferenceDate: '2026-04-09',
    topic: 'Safety escalation review',
    status: 'Upcoming',
    notes: 'Confirm temporary placement plan and legal advocacy coordination.',
  },
]

const EMPTY_FORM: FormState = {
  visitDate: '',
  socialWorker: '',
  visitType: 'Initial Assessment',
  observations: '',
  familyCooperationLevel: 'Moderate',
  safetyConcerns: false,
  followUpActions: '',
}

export default function HomeVisitationCaseConferencesPage() {
  const token = localStorage.getItem('token') ?? ''
  const [residents, setResidents] = useState<Resident[]>(RESIDENTS)
  const [selectedResidentId, setSelectedResidentId] = useState<number>(RESIDENTS[0].id)
  const [visits, setVisits] = useState<HomeVisitEntry[]>(INITIAL_VISITS)
  const [conferences, setConferences] = useState<CaseConference[]>(INITIAL_CONFERENCES)
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/residents`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((rows: Array<{ residentId: number; caseControlNo: string; internalCode: string }>) => {
        const mapped = rows.map((r) => ({ id: r.residentId, name: `${r.caseControlNo} / ${r.internalCode}` }))
        if (mapped.length > 0) {
          setResidents(mapped)
          setSelectedResidentId((prev) => (mapped.some((x) => x.id === prev) ? prev : mapped[0].id))
        }
        setLoadError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Resident API unavailable (${msg}). Showing fallback data.`)
        setResidents(RESIDENTS)
      })
  }, [])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/home-visitations?residentId=${selectedResidentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((rows: HomeVisitEntry[]) => setVisits(rows))
      .catch(() => setVisits(INITIAL_VISITS))

    fetch(`${API_BASE_URL}/api/case-conferences?residentId=${selectedResidentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((rows: CaseConference[]) => setConferences(rows))
      .catch(() => setConferences(INITIAL_CONFERENCES))
  }, [selectedResidentId])

  const selectedResident = residents.find((resident) => resident.id === selectedResidentId)

  const residentVisits = useMemo(
    () =>
      visits
        .filter((visit) => visit.residentId === selectedResidentId)
        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()),
    [visits, selectedResidentId],
  )

  const residentConferences = useMemo(
    () => conferences.filter((conference) => conference.residentId === selectedResidentId),
    [conferences, selectedResidentId],
  )

  const upcomingConferences = useMemo(
    () =>
      residentConferences
        .filter((conference) => conference.status === 'Upcoming')
        .sort((a, b) => new Date(a.conferenceDate).getTime() - new Date(b.conferenceDate).getTime()),
    [residentConferences],
  )

  const conferenceHistory = useMemo(
    () =>
      residentConferences
        .filter((conference) => conference.status === 'Completed')
        .sort((a, b) => new Date(b.conferenceDate).getTime() - new Date(a.conferenceDate).getTime()),
    [residentConferences],
  )

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.visitDate || !formState.socialWorker.trim() || !formState.observations.trim() || !formState.followUpActions.trim()) {
      setFormError('Please complete all required fields before saving this visit.')
      return
    }

    fetch(`${API_BASE_URL}/api/home-visitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        residentId: selectedResidentId,
        visitDate: formState.visitDate,
        socialWorker: formState.socialWorker.trim(),
        visitType: formState.visitType,
        observations: formState.observations.trim(),
        familyCooperationLevel: formState.familyCooperationLevel,
        safetyConcerns: formState.safetyConcerns,
        followUpActions: formState.followUpActions.trim(),
      }),
    })
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((created: HomeVisitEntry) => {
        setVisits((prev) => [created, ...prev].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()))
        setFormState(EMPTY_FORM)
        setFormError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setFormError(`Unable to save visit (${msg}).`)
      })
  }

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold text-stone-900">Home Visitation &amp; Case Conferences</h1>
          <p className="mt-2 text-stone-600">
            Log field visits and track upcoming and historical case conferences for each resident.
          </p>
          {loadError ? <p className="mt-2 text-sm text-amber-700">{loadError}</p> : null}
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 lg:grid-cols-5">
          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-stone-900">New Home/Field Visit</h2>
            <p className="mt-1 text-sm text-stone-600">Record visit details for the selected resident.</p>

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Resident</span>
                <select
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  value={selectedResidentId}
                  onChange={(event) => setSelectedResidentId(Number(event.target.value))}
                >
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Visit Date</span>
                <input
                  type="date"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  value={formState.visitDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, visitDate: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Social Worker</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  value={formState.socialWorker}
                  placeholder="Name of social worker"
                  onChange={(event) => setFormState((prev) => ({ ...prev, socialWorker: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Visit Type</span>
                <select
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  value={formState.visitType}
                  onChange={(event) => setFormState((prev) => ({ ...prev, visitType: event.target.value as VisitType }))}
                >
                  <option value="Initial Assessment">Initial Assessment</option>
                  <option value="Routine Follow-Up">Routine Follow-Up</option>
                  <option value="Reintegration Assessment">Reintegration Assessment</option>
                  <option value="Post-Placement Monitoring">Post-Placement Monitoring</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </label>

              <TextAreaField
                label="Home Environment Observations"
                value={formState.observations}
                placeholder="Observations about environment, family dynamics, and resident stability."
                onChange={(value) => setFormState((prev) => ({ ...prev, observations: value }))}
              />

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Family Cooperation Level</span>
                <select
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  value={formState.familyCooperationLevel}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, familyCooperationLevel: event.target.value as CooperationLevel }))
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </label>

              <fieldset className="rounded-lg border border-stone-200 p-3">
                <legend className="px-1 text-sm font-medium text-stone-700">Safety Concerns</legend>
                <div className="mt-1 flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formState.safetyConcerns === true}
                      onChange={() => setFormState((prev) => ({ ...prev, safetyConcerns: true }))}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formState.safetyConcerns === false}
                      onChange={() => setFormState((prev) => ({ ...prev, safetyConcerns: false }))}
                    />
                    No
                  </label>
                </div>
              </fieldset>

              <TextAreaField
                label="Follow-Up Actions"
                value={formState.followUpActions}
                placeholder="Document next steps, timeline, and responsible contacts."
                onChange={(value) => setFormState((prev) => ({ ...prev, followUpActions: value }))}
              />

              {formError ? <p className="text-sm text-rose-700">{formError}</p> : null}

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Save Visit Record
              </button>
            </form>
          </article>

          <div className="space-y-6 lg:col-span-3">
            <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900">
                {selectedResident?.name ?? 'Resident'} Visitation History
              </h2>
              <p className="mt-1 text-sm text-stone-600">Most recent visits appear first.</p>

              {residentVisits.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
                  No visit records available for this resident.
                </div>
              ) : (
                <div className="mt-4 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                  {residentVisits.map((visit) => (
                    <div key={visit.id} className="rounded-xl border border-stone-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-stone-900">
                          {new Date(visit.visitDate).toLocaleDateString()} - {visit.visitType}
                        </p>
                        <p className="text-xs text-stone-500">Social Worker: {visit.socialWorker}</p>
                      </div>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-stone-700">Family Cooperation:</span> {visit.familyCooperationLevel}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-stone-700">Safety Concerns:</span>{' '}
                        {visit.safetyConcerns ? 'Yes' : 'No'}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-stone-700">Observations:</span> {visit.observations}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-stone-700">Follow-Up Actions:</span> {visit.followUpActions}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900">
                {selectedResident?.name ?? 'Resident'} Case Conferences
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-stone-200 p-4">
                  <h3 className="text-sm font-semibold text-stone-800">Upcoming Conferences</h3>
                  {upcomingConferences.length === 0 ? (
                    <p className="mt-2 text-sm text-stone-600">No upcoming conferences.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm">
                      {upcomingConferences.map((conference) => (
                        <li key={conference.id} className="rounded-lg bg-emerald-50 p-2 text-emerald-900">
                          <p className="font-medium">{new Date(conference.conferenceDate).toLocaleDateString()}</p>
                          <p>{conference.topic}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-stone-200 p-4">
                  <h3 className="text-sm font-semibold text-stone-800">Conference History</h3>
                  {conferenceHistory.length === 0 ? (
                    <p className="mt-2 text-sm text-stone-600">No conference history yet.</p>
                  ) : (
                    <ul className="mt-2 max-h-[32rem] space-y-2 overflow-y-auto pr-1 text-sm">
                      {conferenceHistory.map((conference) => (
                        <li key={conference.id} className="rounded-lg bg-stone-100 p-2">
                          <p className="font-medium text-stone-800">
                            {new Date(conference.conferenceDate).toLocaleDateString()}
                          </p>
                          <p className="text-stone-700">{conference.topic}</p>
                          <p className="text-xs text-stone-600">{conference.notes}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-stone-700">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-lg border border-stone-300 px-3 py-2"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  )
}
