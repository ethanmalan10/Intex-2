import { useEffect, useMemo, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'
import { useAuth } from './context/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL

type Tab = 'supporters' | 'donations' | 'allocations'

interface Supporter {
  supporterId: number
  supporterType: string
  displayName: string
  email: string
  phone?: string | null
  status: string
}

interface Donation {
  donationId: number
  supporterId: number
  donationType: string
  donationDate: string
  amount?: number | null
  estimatedValue?: number | null
  notes?: string | null
}

interface Allocation {
  allocationId: number
  donationId: number
  safehouseId: number
  programArea: string
  amountAllocated: number
  allocationDate: string
}

const emptySupporterForm = {
  supporterType: 'Monetary Donor',
  displayName: '',
  organizationName: '',
  firstName: '',
  lastName: '',
  relationshipType: 'Donor',
  region: '',
  country: 'Brazil',
  email: '',
  phone: '',
  status: 'active',
  firstDonationDate: '',
  acquisitionChannel: '',
}

const emptyDonationForm = {
  supporterId: '',
  donationType: 'Monetary',
  donationDate: '',
  isRecurring: false,
  campaignName: '',
  channelSource: 'Direct',
  currencyCode: 'USD',
  amount: '',
  estimatedValue: '',
  impactUnit: '',
  notes: '',
  referralPostId: '',
}

export default function DonorsContributionsPage() {
  const { user } = useAuth()
  const isAdmin = (user?.roles ?? []).some((r) => r.toLowerCase() === 'admin')
  const token = localStorage.getItem('token')

  const [tab, setTab] = useState<Tab>('supporters')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])

  const [supporterSearch, setSupporterSearch] = useState('')
  const [supporterStatus, setSupporterStatus] = useState('')
  const [supporterType, setSupporterType] = useState('')

  const [supporterForm, setSupporterForm] = useState(emptySupporterForm)
  const [editingSupporterId, setEditingSupporterId] = useState<number | null>(null)
  const [donationForm, setDonationForm] = useState(emptyDonationForm)
  const [editingDonationId, setEditingDonationId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    }),
    [token]
  )

  async function loadAllData() {
    setIsLoading(true)
    setError('')
    try {
      const supportersQuery = new URLSearchParams()
      if (supporterSearch.trim()) supportersQuery.set('search', supporterSearch.trim())
      if (supporterStatus.trim()) supportersQuery.set('status', supporterStatus.trim())
      if (supporterType.trim()) supportersQuery.set('supporterType', supporterType.trim())

      const [supportersRes, donationsRes, allocationsRes] = await Promise.all([
        fetch(`${API}/api/donors-contributions/supporters?${supportersQuery.toString()}`, { headers: authHeaders }),
        fetch(`${API}/api/donors-contributions/donations`, { headers: authHeaders }),
        fetch(`${API}/api/donors-contributions/allocations`, { headers: authHeaders }),
      ])

      if (!supportersRes.ok || !donationsRes.ok || !allocationsRes.ok) {
        throw new Error('Failed to load donors and contributions data.')
      }

      const [supportersData, donationsData, allocationsData] = await Promise.all([
        supportersRes.json(),
        donationsRes.json(),
        allocationsRes.json(),
      ])

      setSupporters(supportersData)
      setDonations(donationsData)
      setAllocations(allocationsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load donors and contributions data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supporterSearch, supporterStatus, supporterType])

  function startEditSupporter(s: Supporter) {
    setEditingSupporterId(s.supporterId)
    setSupporterForm((prev) => ({
      ...prev,
      supporterType: s.supporterType ?? '',
      displayName: s.displayName ?? '',
      email: s.email ?? '',
      phone: s.phone ?? '',
      status: s.status ?? 'active',
    }))
  }

  function startEditDonation(d: Donation) {
    setEditingDonationId(d.donationId)
    setDonationForm((prev) => ({
      ...prev,
      supporterId: String(d.supporterId ?? ''),
      donationType: d.donationType ?? '',
      donationDate: d.donationDate ?? '',
      amount: d.amount != null ? String(d.amount) : '',
      estimatedValue: d.estimatedValue != null ? String(d.estimatedValue) : '',
      notes: d.notes ?? '',
    }))
  }

  async function saveSupporter() {
    if (!isAdmin) return
    setIsSaving(true)
    setError('')
    try {
      const method = editingSupporterId ? 'PUT' : 'POST'
      const url = editingSupporterId
        ? `${API}/api/donors-contributions/supporters/${editingSupporterId}`
        : `${API}/api/donors-contributions/supporters`

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify({
          ...supporterForm,
          firstDonationDate: supporterForm.firstDonationDate || null,
        }),
      })

      if (!res.ok) throw new Error('Could not save supporter.')

      setSupporterForm(emptySupporterForm)
      setEditingSupporterId(null)
      await loadAllData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save supporter.')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveDonation() {
    if (!isAdmin) return
    setIsSaving(true)
    setError('')
    try {
      const method = editingDonationId ? 'PUT' : 'POST'
      const url = editingDonationId
        ? `${API}/api/donors-contributions/donations/${editingDonationId}`
        : `${API}/api/donors-contributions/donations`

      const payload = {
        supporterId: Number(donationForm.supporterId),
        donationType: donationForm.donationType,
        donationDate: donationForm.donationDate,
        isRecurring: donationForm.isRecurring,
        campaignName: donationForm.campaignName || null,
        channelSource: donationForm.channelSource || 'Direct',
        currencyCode: donationForm.currencyCode || 'USD',
        amount: donationForm.amount ? Number(donationForm.amount) : null,
        estimatedValue: donationForm.estimatedValue ? Number(donationForm.estimatedValue) : null,
        impactUnit: donationForm.impactUnit || null,
        notes: donationForm.notes || null,
        referralPostId: donationForm.referralPostId ? Number(donationForm.referralPostId) : null,
      }

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Could not save donation.')

      setDonationForm(emptyDonationForm)
      setEditingDonationId(null)
      await loadAllData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save donation.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-bold text-stone-900">Donors &amp; Contributions</h1>
          <p className="mt-2 text-sm text-stone-600">
            Admins can create and edit supporters and donations. Staff can view records only.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(['supporters', 'donations', 'allocations'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm ${
                  tab === t ? 'bg-teal-600 text-white' : 'bg-white border border-stone-300 text-stone-700'
                }`}
              >
                {t === 'supporters' ? 'Supporters' : t === 'donations' ? 'Donations' : 'Allocations'}
              </button>
            ))}
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {tab === 'supporters' && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Supporter filters</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <input className="rounded border border-stone-300 px-3 py-2" placeholder="Search name or email" value={supporterSearch} onChange={(e) => setSupporterSearch(e.target.value)} />
                  <input className="rounded border border-stone-300 px-3 py-2" placeholder="Status (active/inactive)" value={supporterStatus} onChange={(e) => setSupporterStatus(e.target.value)} />
                  <input className="rounded border border-stone-300 px-3 py-2" placeholder="Type (e.g. volunteer)" value={supporterType} onChange={(e) => setSupporterType(e.target.value)} />
                </div>
              </div>

              {isAdmin && (
                <div className="rounded-xl border border-stone-200 bg-white p-4">
                  <h3 className="text-base font-semibold">{editingSupporterId ? 'Edit supporter' : 'Create supporter'}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Display name" value={supporterForm.displayName} onChange={(e) => setSupporterForm({ ...supporterForm, displayName: e.target.value })} />
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Supporter type" value={supporterForm.supporterType} onChange={(e) => setSupporterForm({ ...supporterForm, supporterType: e.target.value })} />
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Email" value={supporterForm.email} onChange={(e) => setSupporterForm({ ...supporterForm, email: e.target.value })} />
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Phone" value={supporterForm.phone} onChange={(e) => setSupporterForm({ ...supporterForm, phone: e.target.value })} />
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Status" value={supporterForm.status} onChange={(e) => setSupporterForm({ ...supporterForm, status: e.target.value })} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={saveSupporter} disabled={isSaving} className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                      {isSaving ? 'Saving...' : editingSupporterId ? 'Update supporter' : 'Save supporter'}
                    </button>
                    {editingSupporterId && (
                      <button type="button" onClick={() => { setEditingSupporterId(null); setSupporterForm(emptySupporterForm) }} className="rounded border border-stone-300 px-4 py-2 text-sm">
                        Cancel edit
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-stone-100 text-left text-stone-700">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      {isAdmin && <th className="px-4 py-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td className="px-4 py-4" colSpan={isAdmin ? 5 : 4}>Loading supporters...</td></tr>
                    ) : supporters.length === 0 ? (
                      <tr><td className="px-4 py-4" colSpan={isAdmin ? 5 : 4}>No supporters found.</td></tr>
                    ) : supporters.map((s) => (
                      <tr key={s.supporterId} className="border-t border-stone-100">
                        <td className="px-4 py-3">{s.displayName}</td>
                        <td className="px-4 py-3">{s.supporterType}</td>
                        <td className="px-4 py-3">{s.email}</td>
                        <td className="px-4 py-3">{s.status}</td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => startEditSupporter(s)} className="rounded border border-stone-300 px-3 py-1 text-xs">Edit</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'donations' && (
            <div className="mt-6 space-y-4">
              {isAdmin && (
                <div className="rounded-xl border border-stone-200 bg-white p-4">
                  <h3 className="text-base font-semibold">{editingDonationId ? 'Edit donation' : 'Create donation'}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <select className="rounded border border-stone-300 px-3 py-2" value={donationForm.supporterId} onChange={(e) => setDonationForm({ ...donationForm, supporterId: e.target.value })}>
                      <option value="">Select supporter</option>
                      {supporters.map((s) => <option key={s.supporterId} value={s.supporterId}>{s.displayName}</option>)}
                    </select>
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Donation type" value={donationForm.donationType} onChange={(e) => setDonationForm({ ...donationForm, donationType: e.target.value })} />
                    <input type="date" className="rounded border border-stone-300 px-3 py-2" value={donationForm.donationDate} onChange={(e) => setDonationForm({ ...donationForm, donationDate: e.target.value })} />
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Amount" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })} />
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Estimated value" value={donationForm.estimatedValue} onChange={(e) => setDonationForm({ ...donationForm, estimatedValue: e.target.value })} />
                    <input className="rounded border border-stone-300 px-3 py-2" placeholder="Notes" value={donationForm.notes} onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={saveDonation} disabled={isSaving} className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                      {isSaving ? 'Saving...' : editingDonationId ? 'Update donation' : 'Save donation'}
                    </button>
                    {editingDonationId && (
                      <button type="button" onClick={() => { setEditingDonationId(null); setDonationForm(emptyDonationForm) }} className="rounded border border-stone-300 px-4 py-2 text-sm">
                        Cancel edit
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-stone-100 text-left text-stone-700">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Supporter</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Estimated</th>
                      {isAdmin && <th className="px-4 py-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td className="px-4 py-4" colSpan={isAdmin ? 6 : 5}>Loading donations...</td></tr>
                    ) : donations.length === 0 ? (
                      <tr><td className="px-4 py-4" colSpan={isAdmin ? 6 : 5}>No donations found.</td></tr>
                    ) : donations.map((d) => (
                      <tr key={d.donationId} className="border-t border-stone-100">
                        <td className="px-4 py-3">{d.donationDate}</td>
                        <td className="px-4 py-3">{supporters.find((s) => s.supporterId === d.supporterId)?.displayName ?? d.supporterId}</td>
                        <td className="px-4 py-3">{d.donationType}</td>
                        <td className="px-4 py-3">{d.amount ?? '-'}</td>
                        <td className="px-4 py-3">{d.estimatedValue ?? '-'}</td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => startEditDonation(d)} className="rounded border border-stone-300 px-3 py-1 text-xs">Edit</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'allocations' && (
            <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-stone-100 text-left text-stone-700">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Program area</th>
                    <th className="px-4 py-3">Safehouse</th>
                    <th className="px-4 py-3">Donation</th>
                    <th className="px-4 py-3">Amount allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="px-4 py-4" colSpan={5}>Loading allocations...</td></tr>
                  ) : allocations.length === 0 ? (
                    <tr><td className="px-4 py-4" colSpan={5}>No allocation records found.</td></tr>
                  ) : allocations.map((a) => (
                    <tr key={a.allocationId} className="border-t border-stone-100">
                      <td className="px-4 py-3">{a.allocationDate}</td>
                      <td className="px-4 py-3">{a.programArea}</td>
                      <td className="px-4 py-3">{a.safehouseId}</td>
                      <td className="px-4 py-3">{a.donationId}</td>
                      <td className="px-4 py-3">{a.amountAllocated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  )
}
