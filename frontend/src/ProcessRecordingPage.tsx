import { FormEvent, useEffect, useMemo, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'

type Resident = {
  id: number
  name: string
}

type ProcessRecording = {
  id: number
  residentId: number
  sessionDate: string
  socialWorker: string
  sessionType: 'Individual' | 'Group'
  emotionalState: string
  summary: string
  interventions: string
  followUpActions: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

type FormState = {
  sessionDate: string
  socialWorker: string
  sessionType: 'Individual' | 'Group'
  emotionalState: string
  summary: string
  interventions: string
  followUpActions: string
}

const RESIDENTS: Resident[] = [
  { id: 201, name: 'Resident A' },
  { id: 202, name: 'Resident B' },
  { id: 203, name: 'Resident C' },
]

const INITIAL_RECORDINGS: ProcessRecording[] = [
  {
    id: 1,
    residentId: 201,
    sessionDate: '2026-03-30',
    socialWorker: 'Dana James',
    sessionType: 'Individual',
    emotionalState: 'Anxious but cooperative',
    summary: 'Resident discussed stress around upcoming custody hearing and identified top concerns.',
    interventions: 'Grounding techniques, reflective listening, and brief safety planning.',
    followUpActions: 'Coordinate with legal advocate and review coping checklist in next session.',
  },
  {
    id: 2,
    residentId: 201,
    sessionDate: '2026-04-03',
    socialWorker: 'Dana James',
    sessionType: 'Group',
    emotionalState: 'Engaged and hopeful',
    summary: 'Resident participated in peer support circle and shared progress on daily routines.',
    interventions: 'Facilitated peer affirmation exercise and routine reinforcement.',
    followUpActions: 'Track sleep pattern for one week and continue peer accountability.',
  },
  {
    id: 3,
    residentId: 202,
    sessionDate: '2026-04-01',
    socialWorker: 'Chris Nguyen',
    sessionType: 'Individual',
    emotionalState: 'Guarded, intermittently tearful',
    summary: 'Resident reflected on recent family contact and discussed emotional triggers.',
    interventions: 'Emotion labeling, de-escalation coaching, and relapse-prevention reminders.',
    followUpActions: 'Introduce journaling prompt and revisit trigger map during next meeting.',
  },
]

const EMPTY_FORM: FormState = {
  sessionDate: '',
  socialWorker: '',
  sessionType: 'Individual',
  emotionalState: '',
  summary: '',
  interventions: '',
  followUpActions: '',
}

export default function ProcessRecordingPage() {
  const token = localStorage.getItem('token') ?? ''
  const [residents, setResidents] = useState<Resident[]>(RESIDENTS)
  const [selectedResidentId, setSelectedResidentId] = useState<number>(RESIDENTS[0].id)
  const [entries, setEntries] = useState<ProcessRecording[]>(INITIAL_RECORDINGS)
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
        setLoadError(`Resident API unavailable (${msg}). Showing local fallback data.`)
        setResidents(RESIDENTS)
      })
  }, [])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/process-recordings?residentId=${selectedResidentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then(
        (
          rows: Array<{
            id: number
            residentId: number
            sessionDate: string
            socialWorker: string
            sessionType: 'Individual' | 'Group'
            emotionalState: string
            summary: string
            interventions: string
            followUpActions: string
          }>,
        ) => {
          setEntries(rows)
        },
      )
      .catch(() => {
        setEntries(INITIAL_RECORDINGS)
      })
  }, [selectedResidentId])

  const selectedResident = residents.find((r) => r.id === selectedResidentId)

  const residentEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.residentId === selectedResidentId)
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()),
    [entries, selectedResidentId],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !formState.sessionDate ||
      !formState.socialWorker.trim() ||
      !formState.emotionalState.trim() ||
      !formState.summary.trim() ||
      !formState.interventions.trim() ||
      !formState.followUpActions.trim()
    ) {
      setFormError('Please complete all required fields before saving.')
      return
    }

    fetch(`${API_BASE_URL}/api/process-recordings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        residentId: selectedResidentId,
        sessionDate: formState.sessionDate,
        socialWorker: formState.socialWorker.trim(),
        sessionType: formState.sessionType,
        emotionalState: formState.emotionalState.trim(),
        summary: formState.summary.trim(),
        interventions: formState.interventions.trim(),
        followUpActions: formState.followUpActions.trim(),
      }),
    })
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((created: ProcessRecording) => {
        setEntries((prev) => [created, ...prev].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()))
        setFormState(EMPTY_FORM)
        setFormError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setFormError(`Unable to save recording (${msg}).`)
      })
  }

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold text-stone-900">Counseling Notes</h1>
          <p className="mt-2 text-stone-600">
            Document counseling sessions and review each resident&apos;s healing journey over time.
          </p>
          {loadError ? <p className="mt-2 text-sm text-amber-700">{loadError}</p> : null}
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 lg:grid-cols-5">
          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-stone-900">New Counseling Entry</h2>
            <p className="mt-1 text-sm text-stone-600">Create a dated session record for the selected resident.</p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-stone-700">Session Date</span>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2"
                    value={formState.sessionDate}
                    onChange={(event) => setFormState((prev) => ({ ...prev, sessionDate: event.target.value }))}
                    required
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-stone-700">Session Type</span>
                  <select
                    className="w-full rounded-lg border border-stone-300 px-3 py-2"
                    value={formState.sessionType}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, sessionType: event.target.value as FormState['sessionType'] }))
                    }
                  >
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Social Worker</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  placeholder="Name of social worker"
                  value={formState.socialWorker}
                  onChange={(event) => setFormState((prev) => ({ ...prev, socialWorker: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Emotional State Observed</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  placeholder="Observed emotional state"
                  value={formState.emotionalState}
                  onChange={(event) => setFormState((prev) => ({ ...prev, emotionalState: event.target.value }))}
                  required
                />
              </label>

              <TextAreaField
                label="Narrative Summary"
                value={formState.summary}
                placeholder="Summary of discussion and resident progress."
                onChange={(value) => setFormState((prev) => ({ ...prev, summary: value }))}
              />
              <TextAreaField
                label="Interventions Applied"
                value={formState.interventions}
                placeholder="Interventions and methods used during the session."
                onChange={(value) => setFormState((prev) => ({ ...prev, interventions: value }))}
              />
              <TextAreaField
                label="Follow-Up Actions"
                value={formState.followUpActions}
                placeholder="Agreed next steps and accountable owners."
                onChange={(value) => setFormState((prev) => ({ ...prev, followUpActions: value }))}
              />

              {formError ? <p className="text-sm text-rose-700">{formError}</p> : null}

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Save Counseling Entry
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-3">
            <h2 className="text-lg font-semibold text-stone-900">
              {selectedResident?.name ?? 'Resident'} History
            </h2>
            <p className="mt-1 text-sm text-stone-600">Displayed in chronological order (most recent first).</p>

            {residentEntries.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
                No counseling notes yet for this resident.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {residentEntries.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-stone-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-stone-900">
                        {new Date(entry.sessionDate).toLocaleDateString()} - {entry.sessionType} Session
                      </p>
                      <p className="text-xs text-stone-500">Social Worker: {entry.socialWorker}</p>
                    </div>
                    <p className="mt-3 text-sm">
                      <span className="font-semibold text-stone-700">Emotional State:</span> {entry.emotionalState}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-stone-700">Narrative Summary:</span> {entry.summary}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-stone-700">Interventions Applied:</span> {entry.interventions}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-stone-700">Follow-Up Actions:</span> {entry.followUpActions}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
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
