import { FormEvent, useEffect, useMemo, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'

/** Mirrors backend.Models.Resident — date fields as YYYY-MM-DD strings for inputs */
export type ResidentRecord = {
  residentId: number
  caseControlNo: string
  internalCode: string
  safehouseId: number
  caseStatus: string
  sex: string
  dateOfBirth: string
  birthStatus: string
  placeOfBirth: string
  religion: string
  caseCategory: string
  subCatOrphaned: boolean
  subCatTrafficked: boolean
  subCatChildLabor: boolean
  subCatPhysicalAbuse: boolean
  subCatSexualAbuse: boolean
  subCatOsaec: boolean
  subCatCicl: boolean
  subCatAtRisk: boolean
  subCatStreetChild: boolean
  subCatChildWithHiv: boolean
  isPwd: boolean
  pwdType: string
  hasSpecialNeeds: boolean
  specialNeedsDiagnosis: string
  familyIs4ps: boolean
  familySoloParent: boolean
  familyIndigenous: boolean
  familyParentPwd: boolean
  familyInformalSettler: boolean
  dateOfAdmission: string
  ageUponAdmission: string
  presentAge: string
  lengthOfStay: string
  referralSource: string
  referringAgencyPerson: string
  dateColbRegistered: string
  dateColbObtained: string
  assignedSocialWorker: string
  initialCaseAssessment: string
  dateCaseStudyPrepared: string
  reintegrationType: string
  reintegrationStatus: string
  initialRiskLevel: string
  currentRiskLevel: string
  dateEnrolled: string
  dateClosed: string
  createdAt: string
}

export const SAFEHOUSES: Record<number, string> = {
  1: 'Manila Safehouse',
  2: 'Davao Safehouse',
  3: 'Cebu Safehouse',
  4: 'General Santos Safehouse',
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

const SUBCAT_FIELDS: { key: keyof Pick<
  ResidentRecord,
  | 'subCatOrphaned'
  | 'subCatTrafficked'
  | 'subCatChildLabor'
  | 'subCatPhysicalAbuse'
  | 'subCatSexualAbuse'
  | 'subCatOsaec'
  | 'subCatCicl'
  | 'subCatAtRisk'
  | 'subCatStreetChild'
  | 'subCatChildWithHiv'
>; label: string }[] = [
  { key: 'subCatOrphaned', label: 'Orphaned' },
  { key: 'subCatTrafficked', label: 'Trafficked' },
  { key: 'subCatChildLabor', label: 'Child labor' },
  { key: 'subCatPhysicalAbuse', label: 'Physical abuse' },
  { key: 'subCatSexualAbuse', label: 'Sexual abuse' },
  { key: 'subCatOsaec', label: 'OSAEC' },
  { key: 'subCatCicl', label: 'CICL' },
  { key: 'subCatAtRisk', label: 'At risk' },
  { key: 'subCatStreetChild', label: 'Street child' },
  { key: 'subCatChildWithHiv', label: 'Child with HIV' },
]

function emptyResident(residentId: number): ResidentRecord {
  const today = new Date().toISOString().slice(0, 10)
  return {
    residentId,
    caseControlNo: '',
    internalCode: '',
    safehouseId: 1,
    caseStatus: 'Active',
    sex: 'F',
    dateOfBirth: today,
    birthStatus: '',
    placeOfBirth: '',
    religion: '',
    caseCategory: '',
    subCatOrphaned: false,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: false,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4ps: false,
    familySoloParent: false,
    familyIndigenous: false,
    familyParentPwd: false,
    familyInformalSettler: false,
    dateOfAdmission: today,
    ageUponAdmission: '',
    presentAge: '',
    lengthOfStay: '',
    referralSource: '',
    referringAgencyPerson: '',
    dateColbRegistered: '',
    dateColbObtained: '',
    assignedSocialWorker: '',
    initialCaseAssessment: '',
    dateCaseStudyPrepared: '',
    reintegrationType: '',
    reintegrationStatus: '',
    initialRiskLevel: 'Medium',
    currentRiskLevel: 'Medium',
    dateEnrolled: today,
    dateClosed: '',
    createdAt: new Date().toISOString(),
  }
}

const INITIAL_RESIDENTS: ResidentRecord[] = [
  {
    residentId: 1,
    caseControlNo: 'C0043',
    internalCode: 'LS-0001',
    safehouseId: 4,
    caseStatus: 'Active',
    sex: 'F',
    dateOfBirth: '2008-08-31',
    birthStatus: 'Marital',
    placeOfBirth: 'Davao City',
    religion: 'Unspecified',
    caseCategory: 'Neglected',
    subCatOrphaned: false,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: false,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: true,
    specialNeedsDiagnosis: 'Speech Impairment',
    familyIs4ps: false,
    familySoloParent: false,
    familyIndigenous: false,
    familyParentPwd: false,
    familyInformalSettler: false,
    dateOfAdmission: '2023-10-17',
    ageUponAdmission: '15 Years 9 months',
    presentAge: '17 Years 6 months',
    lengthOfStay: '2 Years 4 months',
    referralSource: 'NGO',
    referringAgencyPerson: 'Ramon Cruz',
    dateColbRegistered: '',
    dateColbObtained: '',
    assignedSocialWorker: 'SW-15',
    initialCaseAssessment: 'For Reunification',
    dateCaseStudyPrepared: '2023-12-14',
    reintegrationType: 'Foster Care',
    reintegrationStatus: 'In Progress',
    initialRiskLevel: 'Critical',
    currentRiskLevel: 'High',
    dateEnrolled: '2023-10-17',
    dateClosed: '',
    createdAt: '2023-10-17T00:00:00.000Z',
  },
  {
    residentId: 2,
    caseControlNo: 'C2530',
    internalCode: 'LS-0002',
    safehouseId: 3,
    caseStatus: 'Closed',
    sex: 'F',
    dateOfBirth: '2008-04-23',
    birthStatus: 'Marital',
    placeOfBirth: 'Cebu City',
    religion: 'Seventh-day Adventist',
    caseCategory: 'Surrendered',
    subCatOrphaned: false,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: true,
    subCatStreetChild: true,
    subCatChildWithHiv: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4ps: false,
    familySoloParent: false,
    familyIndigenous: true,
    familyParentPwd: false,
    familyInformalSettler: false,
    dateOfAdmission: '2023-03-18',
    ageUponAdmission: '15 Years 5 months',
    presentAge: '17 Years 10 months',
    lengthOfStay: '1 Years 9 months',
    referralSource: 'Government Agency',
    referringAgencyPerson: 'Ana Cruz',
    dateColbRegistered: '2023-07-06',
    dateColbObtained: '2024-12-30',
    assignedSocialWorker: 'SW-14',
    initialCaseAssessment: 'For Continued Care',
    dateCaseStudyPrepared: '2023-04-10',
    reintegrationType: 'Family Reunification',
    reintegrationStatus: 'Completed',
    initialRiskLevel: 'Medium',
    currentRiskLevel: 'Medium',
    dateEnrolled: '2023-03-18',
    dateClosed: '2025-01-06',
    createdAt: '2023-03-18T00:00:00.000Z',
  },
  {
    residentId: 3,
    caseControlNo: 'C3946',
    internalCode: 'LS-0003',
    safehouseId: 1,
    caseStatus: 'Active',
    sex: 'F',
    dateOfBirth: '2007-01-31',
    birthStatus: 'Marital',
    placeOfBirth: 'Manila',
    religion: 'Roman Catholic',
    caseCategory: 'Surrendered',
    subCatOrphaned: false,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: true,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: false,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4ps: false,
    familySoloParent: false,
    familyIndigenous: false,
    familyParentPwd: false,
    familyInformalSettler: false,
    dateOfAdmission: '2024-05-24',
    ageUponAdmission: '18 Years 3 months',
    presentAge: '19 Years 1 months',
    lengthOfStay: '1 Years 9 months',
    referralSource: 'Government Agency',
    referringAgencyPerson: '',
    dateColbRegistered: '2024-08-02',
    dateColbObtained: '2024-09-21',
    assignedSocialWorker: 'SW-20',
    initialCaseAssessment: 'For Independent Living',
    dateCaseStudyPrepared: '',
    reintegrationType: 'Foster Care',
    reintegrationStatus: 'Completed',
    initialRiskLevel: 'Medium',
    currentRiskLevel: 'Medium',
    dateEnrolled: '2024-05-24',
    dateClosed: '',
    createdAt: '2024-05-24T00:00:00.000Z',
  },
  {
    residentId: 4,
    caseControlNo: 'C3116',
    internalCode: 'LS-0004',
    safehouseId: 2,
    caseStatus: 'Active',
    sex: 'F',
    dateOfBirth: '2012-06-29',
    birthStatus: 'Marital',
    placeOfBirth: 'Davao City',
    religion: 'Evangelical',
    caseCategory: 'Neglected',
    subCatOrphaned: false,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatOsaec: false,
    subCatCicl: true,
    subCatAtRisk: false,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4ps: false,
    familySoloParent: false,
    familyIndigenous: false,
    familyParentPwd: false,
    familyInformalSettler: false,
    dateOfAdmission: '2024-09-27',
    ageUponAdmission: '12 Years 11 months',
    presentAge: '13 Years 8 months',
    lengthOfStay: '1 Years 5 months',
    referralSource: 'Court Order',
    referringAgencyPerson: '',
    dateColbRegistered: '',
    dateColbObtained: '',
    assignedSocialWorker: 'SW-15',
    initialCaseAssessment: 'For Reunification',
    dateCaseStudyPrepared: '2024-10-25',
    reintegrationType: 'None',
    reintegrationStatus: 'On Hold',
    initialRiskLevel: 'High',
    currentRiskLevel: 'Low',
    dateEnrolled: '2024-09-27',
    dateClosed: '',
    createdAt: '2024-09-27T00:00:00.000Z',
  },
  {
    residentId: 5,
    caseControlNo: 'C5001',
    internalCode: 'LS-0005',
    safehouseId: 1,
    caseStatus: 'Active',
    sex: 'M',
    dateOfBirth: '2010-03-15',
    birthStatus: 'Marital',
    placeOfBirth: 'Quezon City',
    religion: 'Roman Catholic',
    caseCategory: 'Trafficked',
    subCatOrphaned: false,
    subCatTrafficked: true,
    subCatChildLabor: false,
    subCatPhysicalAbuse: true,
    subCatSexualAbuse: false,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: false,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    isPwd: true,
    pwdType: 'Physical disability',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    familyIs4ps: true,
    familySoloParent: true,
    familyIndigenous: false,
    familyParentPwd: false,
    familyInformalSettler: true,
    dateOfAdmission: '2025-01-10',
    ageUponAdmission: '14 Years 10 months',
    presentAge: '15 Years 1 months',
    lengthOfStay: '3 months',
    referralSource: 'DSWD referral',
    referringAgencyPerson: 'Maria Santos',
    dateColbRegistered: '2025-01-12',
    dateColbObtained: '',
    assignedSocialWorker: 'SW-22',
    initialCaseAssessment: 'For continued care',
    dateCaseStudyPrepared: '2025-02-01',
    reintegrationType: 'Family Reunification',
    reintegrationStatus: 'In Progress',
    initialRiskLevel: 'High',
    currentRiskLevel: 'High',
    dateEnrolled: '2025-01-10',
    dateClosed: '',
    createdAt: '2025-01-10T00:00:00.000Z',
  },
  {
    residentId: 6,
    caseControlNo: 'C5002',
    internalCode: 'LS-0006',
    safehouseId: 4,
    caseStatus: 'Transferred',
    sex: 'F',
    dateOfBirth: '2009-11-20',
    birthStatus: 'Marital',
    placeOfBirth: 'Iloilo',
    religion: 'Unspecified',
    caseCategory: 'Neglected',
    subCatOrphaned: true,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: true,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    isPwd: false,
    pwdType: '',
    hasSpecialNeeds: true,
    specialNeedsDiagnosis: 'Learning disability',
    familyIs4ps: false,
    familySoloParent: false,
    familyIndigenous: true,
    familyParentPwd: false,
    familyInformalSettler: false,
    dateOfAdmission: '2024-02-01',
    ageUponAdmission: '14 Years 3 months',
    presentAge: '16 Years 5 months',
    lengthOfStay: '1 Year 2 months',
    referralSource: 'Barangay',
    referringAgencyPerson: '',
    dateColbRegistered: '',
    dateColbObtained: '',
    assignedSocialWorker: 'SW-11',
    initialCaseAssessment: 'For independent living',
    dateCaseStudyPrepared: '',
    reintegrationType: 'Independent living',
    reintegrationStatus: 'Planning',
    initialRiskLevel: 'Medium',
    currentRiskLevel: 'Medium',
    dateEnrolled: '2024-02-01',
    dateClosed: '',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
]

function rowLabel(r: ResidentRecord) {
  return `${r.caseControlNo} / ${r.internalCode}`
}

function subcatBadges(r: ResidentRecord): string[] {
  const out: string[] = []
  for (const { key, label } of SUBCAT_FIELDS) {
    if (r[key]) out.push(label)
  }
  return out
}

function formatOptionalDate(s: string) {
  if (!s) return '—'
  try {
    return new Date(s + 'T12:00:00').toLocaleDateString()
  } catch {
    return s
  }
}

export default function CaseloadInventoryPage() {
  const [residents, setResidents] = useState<ResidentRecord[]>(INITIAL_RESIDENTS)
  const [filterOptionsSource, setFilterOptionsSource] = useState<ResidentRecord[]>(INITIAL_RESIDENTS)
  const [nextId, setNextId] = useState(7)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSafehouse, setFilterSafehouse] = useState<number | ''>('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterTraffickedOnly, setFilterTraffickedOnly] = useState(false)
  const [filterPhysicalAbuseOnly, setFilterPhysicalAbuseOnly] = useState(false)

  const [selectedId, setSelectedId] = useState<number | null>(1)
  const [panelMode, setPanelMode] = useState<'view' | 'edit' | 'create'>('view')
  const [draft, setDraft] = useState<ResidentRecord | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/residents`)
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((rows: ResidentRecord[]) => {
        setFilterOptionsSource(rows.length > 0 ? rows : INITIAL_RESIDENTS)
      })
      .catch(() => {
        setFilterOptionsSource(INITIAL_RESIDENTS)
      })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (filterStatus) params.set('status', filterStatus)
    if (filterSafehouse !== '') params.set('safehouseId', String(filterSafehouse))
    if (filterCategory) params.set('caseCategory', filterCategory)

    const endpoint = `${API_BASE_URL}/api/residents${params.toString() ? `?${params}` : ''}`
    fetch(endpoint)
      .then(async (res) => {
        if (res.ok) return res.json()
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      })
      .then((rows: ResidentRecord[]) => {
        setResidents(rows)
        setLoadError(null)
        if (rows.length > 0 && !rows.some((r) => r.residentId === selectedId) && panelMode !== 'create') {
          setSelectedId(rows[0].residentId)
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Live API unavailable (${msg}). Showing local fallback records.`)
        setResidents(INITIAL_RESIDENTS)
      })
  }, [searchQuery, filterStatus, filterSafehouse, filterCategory, panelMode, selectedId])

  const distinctStatuses = useMemo(
    () => [...new Set(filterOptionsSource.map((r) => r.caseStatus))].sort(),
    [filterOptionsSource],
  )
  const distinctCategories = useMemo(
    () => [...new Set(filterOptionsSource.map((r) => r.caseCategory))].filter(Boolean).sort(),
    [filterOptionsSource],
  )

  const filteredResidents = useMemo(() => {
    return residents
      .filter((r) => {
        if (filterTraffickedOnly && !r.subCatTrafficked) return false
        if (filterPhysicalAbuseOnly && !r.subCatPhysicalAbuse) return false
        return true
      })
      .sort((a, b) => (a.dateOfAdmission < b.dateOfAdmission ? 1 : a.dateOfAdmission > b.dateOfAdmission ? -1 : 0))
  }, [
    residents,
    filterTraffickedOnly,
    filterPhysicalAbuseOnly,
  ])

  const selected = selectedId != null ? residents.find((r) => r.residentId === selectedId) : null

  const startCreate = () => {
    const blank = emptyResident(nextId)
    setSelectedId(null)
    setDraft(blank)
    setPanelMode('create')
    setFormError(null)
  }

  const startEdit = () => {
    if (!selected) return
    setDraft({ ...selected })
    setPanelMode('edit')
    setFormError(null)
  }

  const cancelPanelForm = () => {
    setDraft(null)
    setFormError(null)
    if (panelMode === 'create') {
      setPanelMode('view')
      setSelectedId(residents[0]?.residentId ?? null)
    } else {
      setPanelMode('view')
    }
  }

  const validateDraft = (d: ResidentRecord): string | null => {
    if (!d.caseControlNo.trim()) return 'Case control number is required.'
    if (!d.internalCode.trim()) return 'Internal code is required.'
    if (!d.caseStatus.trim()) return 'Case status is required.'
    if (!d.caseCategory.trim()) return 'Case category is required.'
    if (!d.sex.trim()) return 'Sex is required.'
    if (!d.dateOfBirth) return 'Date of birth is required.'
    if (!d.dateOfAdmission) return 'Date of admission is required.'
    if (!d.dateEnrolled) return 'Date enrolled is required.'
    if (!d.initialRiskLevel.trim()) return 'Initial risk level is required.'
    if (!d.currentRiskLevel.trim()) return 'Current risk level is required.'
    if (!SAFEHOUSES[d.safehouseId]) return 'Select a valid safehouse.'
    return null
  }

  const saveDraft = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft) return
    const err = validateDraft(draft)
    if (err) {
      setFormError(err)
      return
    }
    try {
      const method = panelMode === 'create' ? 'POST' : 'PUT'
      const endpoint =
        panelMode === 'create'
          ? `${API_BASE_URL}/api/residents`
          : `${API_BASE_URL}/api/residents/${draft.residentId}`

      const payload = {
        caseControlNo: draft.caseControlNo,
        internalCode: draft.internalCode,
        safehouseId: draft.safehouseId,
        caseStatus: draft.caseStatus,
        sex: draft.sex,
        dateOfBirth: draft.dateOfBirth,
        birthStatus: draft.birthStatus || null,
        placeOfBirth: draft.placeOfBirth || null,
        religion: draft.religion || null,
        caseCategory: draft.caseCategory,
        subCatOrphaned: draft.subCatOrphaned,
        subCatTrafficked: draft.subCatTrafficked,
        subCatChildLabor: draft.subCatChildLabor,
        subCatPhysicalAbuse: draft.subCatPhysicalAbuse,
        subCatSexualAbuse: draft.subCatSexualAbuse,
        subCatOsaec: draft.subCatOsaec,
        subCatCicl: draft.subCatCicl,
        subCatAtRisk: draft.subCatAtRisk,
        subCatStreetChild: draft.subCatStreetChild,
        subCatChildWithHiv: draft.subCatChildWithHiv,
        isPwd: draft.isPwd,
        pwdType: draft.pwdType || null,
        hasSpecialNeeds: draft.hasSpecialNeeds,
        specialNeedsDiagnosis: draft.specialNeedsDiagnosis || null,
        familyIs4ps: draft.familyIs4ps,
        familySoloParent: draft.familySoloParent,
        familyIndigenous: draft.familyIndigenous,
        familyParentPwd: draft.familyParentPwd,
        familyInformalSettler: draft.familyInformalSettler,
        dateOfAdmission: draft.dateOfAdmission,
        ageUponAdmission: draft.ageUponAdmission || null,
        presentAge: draft.presentAge || null,
        lengthOfStay: draft.lengthOfStay || null,
        referralSource: draft.referralSource || null,
        referringAgencyPerson: draft.referringAgencyPerson || null,
        dateColbRegistered: draft.dateColbRegistered || null,
        dateColbObtained: draft.dateColbObtained || null,
        assignedSocialWorker: draft.assignedSocialWorker || null,
        initialCaseAssessment: draft.initialCaseAssessment || null,
        dateCaseStudyPrepared: draft.dateCaseStudyPrepared || null,
        reintegrationType: draft.reintegrationType || null,
        reintegrationStatus: draft.reintegrationStatus || null,
        initialRiskLevel: draft.initialRiskLevel,
        currentRiskLevel: draft.currentRiskLevel,
        dateEnrolled: draft.dateEnrolled,
        dateClosed: draft.dateClosed || null,
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
      }

      const saved = (await res.json()) as ResidentRecord
      if (panelMode === 'create') {
        setResidents((prev) => [saved, ...prev])
        setNextId((n) => n + 1)
      } else {
        setResidents((prev) => prev.map((r) => (r.residentId === saved.residentId ? saved : r)))
      }
      setSelectedId(saved.residentId)
      setPanelMode('view')
      setDraft(null)
      setFormError(null)
    } catch (saveErr: unknown) {
      const msg = saveErr instanceof Error ? saveErr.message : 'Unknown error'
      setFormError(`Unable to save resident (${msg}).`)
    }
  }

  const activeDraft = panelMode === 'create' || panelMode === 'edit' ? draft : null
  const showView = panelMode === 'view' && selected && !draft

  const updateDraft = (patch: Partial<ResidentRecord>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
  }

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Caseload Inventory</h1>
              <p className="mt-2 text-stone-600">
                Core case management: resident profiles aligned with agency records. Search, filter, and maintain
                demographics, case category, disability, family profile, admission, referral, assignment, and
                reintegration.
              </p>
              {loadError ? <p className="mt-2 text-sm text-amber-700">{loadError}</p> : null}
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Add resident
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-4 px-6 pb-6">
          <div className="flex flex-wrap gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <label className="min-w-[180px] flex-1 text-sm">
              <span className="mb-1 block font-medium text-stone-700">Search</span>
              <input
                type="search"
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
                placeholder="Case control, internal code, SW, referral, category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <label className="min-w-[140px] text-sm">
              <span className="mb-1 block font-medium text-stone-700">Case status</span>
              <select
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                {distinctStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[160px] text-sm">
              <span className="mb-1 block font-medium text-stone-700">Safehouse</span>
              <select
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
                value={filterSafehouse === '' ? '' : String(filterSafehouse)}
                onChange={(e) => setFilterSafehouse(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">All</option>
                {Object.entries(SAFEHOUSES).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[160px] text-sm">
              <span className="mb-1 block font-medium text-stone-700">Case category</span>
              <select
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All</option>
                {distinctCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Quick filters</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterTraffickedOnly((v) => !v)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    filterTraffickedOnly ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Trafficked
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPhysicalAbuseOnly((v) => !v)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    filterPhysicalAbuseOnly ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Physical abuse
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-200 px-4 py-3">
                  <h2 className="text-sm font-semibold text-stone-800">Residents ({filteredResidents.length})</h2>
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-xs text-stone-500">
                        <th className="px-3 py-2">Record</th>
                        <th className="px-3 py-2">Safehouse</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResidents.map((r) => {
                        const badges = subcatBadges(r).slice(0, 2)
                        const more = subcatBadges(r).length - badges.length
                        return (
                          <tr
                            key={r.residentId}
                            className={`cursor-pointer border-b border-stone-100 hover:bg-stone-50 ${
                              selectedId === r.residentId && panelMode !== 'create' ? 'bg-teal-50' : ''
                            }`}
                            onClick={() => {
                              setSelectedId(r.residentId)
                              setPanelMode('view')
                              setDraft(null)
                              setFormError(null)
                            }}
                          >
                            <td className="px-3 py-2">
                              <p className="font-medium text-stone-900">{rowLabel(r)}</p>
                              <p className="text-xs text-stone-500">{r.caseCategory}</p>
                              {badges.length > 0 && (
                                <p className="mt-1 text-xs text-teal-800">
                                  {badges.join(', ')}
                                  {more > 0 ? ` +${more}` : ''}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-2 text-stone-700">{SAFEHOUSES[r.safehouseId] ?? r.safehouseId}</td>
                            <td className="px-3 py-2 text-stone-700">{r.caseStatus}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden divide-y divide-stone-100">
                  {filteredResidents.map((r) => (
                    <button
                      key={r.residentId}
                      type="button"
                      className={`w-full px-4 py-3 text-left hover:bg-stone-50 ${
                        selectedId === r.residentId && panelMode !== 'create' ? 'bg-teal-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedId(r.residentId)
                        setPanelMode('view')
                        setDraft(null)
                        setFormError(null)
                      }}
                    >
                      <p className="font-medium text-stone-900">{rowLabel(r)}</p>
                      <p className="text-xs text-stone-500">
                        {SAFEHOUSES[r.safehouseId]} · {r.caseStatus} · {r.caseCategory}
                      </p>
                    </button>
                  ))}
                </div>
                {filteredResidents.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-stone-500">No residents match these filters.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                {panelMode === 'create' && activeDraft && (
                  <ProfileForm
                    title="New resident profile"
                    draft={activeDraft}
                    updateDraft={updateDraft}
                    onSubmit={saveDraft}
                    onCancel={cancelPanelForm}
                    formError={formError}
                    submitLabel="Create profile"
                  />
                )}
                {panelMode === 'edit' && activeDraft && (
                  <ProfileForm
                    title="Edit resident profile"
                    draft={activeDraft}
                    updateDraft={updateDraft}
                    onSubmit={saveDraft}
                    onCancel={cancelPanelForm}
                    formError={formError}
                    submitLabel="Save changes"
                  />
                )}
                {showView && selected && (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-stone-900">{rowLabel(selected)}</h2>
                        <p className="text-sm text-stone-500">Resident ID: {selected.residentId}</p>
                      </div>
                      <button
                        type="button"
                        onClick={startEdit}
                        className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                      >
                        Edit profile
                      </button>
                    </div>
                    <ProfileReadOnly r={selected} />
                    <p className="mt-6 border-t border-stone-200 pt-4 text-xs text-stone-400">
                      Restricted notes are not shown on this preview. They will be available once authentication and role
                      checks are enabled.
                    </p>
                  </>
                )}
                {panelMode === 'view' && !selected && (
                  <p className="text-sm text-stone-600">Select a resident from the list or add a new profile.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

function ProfileReadOnly({ r }: { r: ResidentRecord }) {
  return (
    <div className="mt-6 space-y-6">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Identity &amp; placement</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Safehouse" value={SAFEHOUSES[r.safehouseId] ?? String(r.safehouseId)} />
          <Field label="Case status" value={r.caseStatus} />
          <Field label="Created at" value={new Date(r.createdAt).toLocaleString()} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Demographics</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Sex" value={r.sex} />
          <Field label="Date of birth" value={formatOptionalDate(r.dateOfBirth)} />
          <Field label="Birth status" value={r.birthStatus || '—'} />
          <Field label="Place of birth" value={r.placeOfBirth || '—'} />
          <Field label="Religion" value={r.religion || '—'} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Case category &amp; sub-categories</h3>
        <p className="mt-2 text-sm">
          <span className="font-medium text-stone-700">Category:</span> {r.caseCategory}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {SUBCAT_FIELDS.filter((x) => r[x.key]).map((x) => (
            <span key={x.key} className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-900">
              {x.label}
            </span>
          ))}
          {SUBCAT_FIELDS.every((x) => !r[x.key]) && <span className="text-sm text-stone-500">No sub-category flags</span>}
        </div>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Disability &amp; special needs</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="PWD" value={r.isPwd ? 'Yes' : 'No'} />
          <Field label="PWD type" value={r.pwdType || '—'} />
          <Field label="Special needs" value={r.hasSpecialNeeds ? 'Yes' : 'No'} />
          <Field label="Diagnosis / notes" value={r.specialNeedsDiagnosis || '—'} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Family socio-demographic</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="4Ps beneficiary" value={r.familyIs4ps ? 'Yes' : 'No'} />
          <Field label="Solo parent household" value={r.familySoloParent ? 'Yes' : 'No'} />
          <Field label="Indigenous group" value={r.familyIndigenous ? 'Yes' : 'No'} />
          <Field label="Informal settler" value={r.familyInformalSettler ? 'Yes' : 'No'} />
          <Field label="Parent PWD" value={r.familyParentPwd ? 'Yes' : 'No'} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Admission</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Date of admission" value={formatOptionalDate(r.dateOfAdmission)} />
          <Field label="Age upon admission" value={r.ageUponAdmission || '—'} />
          <Field label="Present age" value={r.presentAge || '—'} />
          <Field label="Length of stay" value={r.lengthOfStay || '—'} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Referral</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Referral source" value={r.referralSource || '—'} />
          <Field label="Referring agency / person" value={r.referringAgencyPerson || '—'} />
          <Field label="COLB registered" value={formatOptionalDate(r.dateColbRegistered)} />
          <Field label="COLB obtained" value={formatOptionalDate(r.dateColbObtained)} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Assignment &amp; case study</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Assigned social worker" value={r.assignedSocialWorker || '—'} />
          <Field label="Initial case assessment" value={r.initialCaseAssessment || '—'} />
          <Field label="Date case study prepared" value={formatOptionalDate(r.dateCaseStudyPrepared)} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Reintegration &amp; risk</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Reintegration type" value={r.reintegrationType || '—'} />
          <Field label="Reintegration status" value={r.reintegrationStatus || '—'} />
          <Field label="Initial risk level" value={r.initialRiskLevel} />
          <Field label="Current risk level" value={r.currentRiskLevel} />
          <Field label="Date enrolled" value={formatOptionalDate(r.dateEnrolled)} />
          <Field label="Date closed" value={r.dateClosed ? formatOptionalDate(r.dateClosed) : '—'} />
        </dl>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="text-stone-800">{value}</dd>
    </div>
  )
}

function ProfileForm({
  title,
  draft,
  updateDraft,
  onSubmit,
  onCancel,
  formError,
  submitLabel,
}: {
  title: string
  draft: ResidentRecord
  updateDraft: (patch: Partial<ResidentRecord>) => void
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
  formError: string | null
  submitLabel: string
}) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-stone-900">{title}</h2>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-stone-600 hover:text-stone-900">
          Cancel
        </button>
      </div>
      {formError && <p className="text-sm text-rose-700">{formError}</p>}

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Identity &amp; placement</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput label="Case control no." value={draft.caseControlNo} onChange={(v) => updateDraft({ caseControlNo: v })} required />
          <TextInput label="Internal code" value={draft.internalCode} onChange={(v) => updateDraft({ internalCode: v })} required />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">Safehouse</span>
            <select
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              value={draft.safehouseId}
              onChange={(e) => updateDraft({ safehouseId: Number(e.target.value) })}
            >
              {Object.entries(SAFEHOUSES).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <TextInput label="Case status" value={draft.caseStatus} onChange={(v) => updateDraft({ caseStatus: v })} required />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Demographics</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">Sex</span>
            <select
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              value={draft.sex}
              onChange={(e) => updateDraft({ sex: e.target.value })}
            >
              <option value="F">F</option>
              <option value="M">M</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">Date of birth</span>
            <input
              type="date"
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              value={draft.dateOfBirth}
              onChange={(e) => updateDraft({ dateOfBirth: e.target.value })}
              required
            />
          </label>
          <TextInput label="Birth status" value={draft.birthStatus} onChange={(v) => updateDraft({ birthStatus: v })} />
          <TextInput label="Place of birth" value={draft.placeOfBirth} onChange={(v) => updateDraft({ placeOfBirth: v })} />
          <TextInput label="Religion" value={draft.religion} onChange={(v) => updateDraft({ religion: v })} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Case category &amp; sub-categories</legend>
        <div className="mt-3">
          <TextInput label="Case category" value={draft.caseCategory} onChange={(v) => updateDraft({ caseCategory: v })} required />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SUBCAT_FIELDS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft[key]}
                  onChange={(e) => updateDraft({ [key]: e.target.checked } as Partial<ResidentRecord>)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Disability &amp; special needs</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.isPwd} onChange={(e) => updateDraft({ isPwd: e.target.checked })} />
            PWD
          </label>
          <TextInput label="PWD type" value={draft.pwdType} onChange={(v) => updateDraft({ pwdType: v })} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.hasSpecialNeeds}
              onChange={(e) => updateDraft({ hasSpecialNeeds: e.target.checked })}
            />
            Special needs
          </label>
          <TextInput
            label="Special needs diagnosis"
            value={draft.specialNeedsDiagnosis}
            onChange={(v) => updateDraft({ specialNeedsDiagnosis: v })}
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Family socio-demographic</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Checkbox label="4Ps beneficiary" checked={draft.familyIs4ps} onChange={(v) => updateDraft({ familyIs4ps: v })} />
          <Checkbox label="Solo parent household" checked={draft.familySoloParent} onChange={(v) => updateDraft({ familySoloParent: v })} />
          <Checkbox label="Indigenous group" checked={draft.familyIndigenous} onChange={(v) => updateDraft({ familyIndigenous: v })} />
          <Checkbox
            label="Informal settler"
            checked={draft.familyInformalSettler}
            onChange={(v) => updateDraft({ familyInformalSettler: v })}
          />
          <Checkbox label="Parent PWD" checked={draft.familyParentPwd} onChange={(v) => updateDraft({ familyParentPwd: v })} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Admission</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">Date of admission</span>
            <input
              type="date"
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              value={draft.dateOfAdmission}
              onChange={(e) => updateDraft({ dateOfAdmission: e.target.value })}
              required
            />
          </label>
          <TextInput
            label="Age upon admission"
            value={draft.ageUponAdmission}
            onChange={(v) => updateDraft({ ageUponAdmission: v })}
          />
          <TextInput label="Present age" value={draft.presentAge} onChange={(v) => updateDraft({ presentAge: v })} />
          <TextInput label="Length of stay" value={draft.lengthOfStay} onChange={(v) => updateDraft({ lengthOfStay: v })} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Referral</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput label="Referral source" value={draft.referralSource} onChange={(v) => updateDraft({ referralSource: v })} />
          <TextInput
            label="Referring agency / person"
            value={draft.referringAgencyPerson}
            onChange={(v) => updateDraft({ referringAgencyPerson: v })}
          />
          <OptionalDate label="COLB registered" value={draft.dateColbRegistered} onChange={(v) => updateDraft({ dateColbRegistered: v })} />
          <OptionalDate label="COLB obtained" value={draft.dateColbObtained} onChange={(v) => updateDraft({ dateColbObtained: v })} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Assignment &amp; case study</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput
            label="Assigned social worker"
            value={draft.assignedSocialWorker}
            onChange={(v) => updateDraft({ assignedSocialWorker: v })}
          />
          <TextInput
            label="Initial case assessment"
            value={draft.initialCaseAssessment}
            onChange={(v) => updateDraft({ initialCaseAssessment: v })}
          />
          <OptionalDate
            label="Date case study prepared"
            value={draft.dateCaseStudyPrepared}
            onChange={(v) => updateDraft({ dateCaseStudyPrepared: v })}
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Reintegration &amp; risk</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput label="Reintegration type" value={draft.reintegrationType} onChange={(v) => updateDraft({ reintegrationType: v })} />
          <TextInput
            label="Reintegration status"
            value={draft.reintegrationStatus}
            onChange={(v) => updateDraft({ reintegrationStatus: v })}
          />
          <TextInput
            label="Initial risk level"
            value={draft.initialRiskLevel}
            onChange={(v) => updateDraft({ initialRiskLevel: v })}
            required
          />
          <TextInput
            label="Current risk level"
            value={draft.currentRiskLevel}
            onChange={(v) => updateDraft({ currentRiskLevel: v })}
            required
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">Date enrolled</span>
            <input
              type="date"
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              value={draft.dateEnrolled}
              onChange={(e) => updateDraft({ dateEnrolled: e.target.value })}
              required
            />
          </label>
          <OptionalDate label="Date closed" value={draft.dateClosed} onChange={(v) => updateDraft({ dateClosed: v })} />
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800">
          Cancel
        </button>
      </div>
    </form>
  )
}

function TextInput({
  label,
  value,
  onChange,
  required: req,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-stone-700">{label}</span>
      <input
        className="w-full rounded-lg border border-stone-300 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={req}
      />
    </label>
  )
}

function OptionalDate({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-stone-700">{label}</span>
      <input type="date" className="w-full rounded-lg border border-stone-300 px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
