import { useEffect, useState } from 'react'
import PublicLayout from './components/layout/PublicLayout'

type AdminData = {
  generatedAtUtc: string
  commandCenter: {
    activeResidents: number
    donationsLast30Count: number
    donationsLast30Amount: number
    upcomingCaseConferences14d: number
    progressNotedRate30d: number
  }
  inactiveSupporterRisk: {
    activeSupporters: number
    highRiskCount: number
    mediumRiskCount: number
    lowRiskCount: number
    topAtRisk: Array<{
      supporterId: number
      displayName: string
      recencyDays: number
      frequency365: number
      channelCount365: number
      recurringShare365: number
      riskScore: number
      riskBand: 'High' | 'Medium' | 'Low'
    }>
  }
}

type UserRow = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  primaryRole: string
  totalDonations: number
  createdAt?: string
  supporterId?: number
  supporterStatus?: string
}

type UserDetail = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  supporter?: {
    supporterId: number
    status: string
    createdAt?: string
    firstDonationDate?: string
  }
  recentDonations: Array<{
    donationId: number
    donationDate: string
    amount?: number
    donationType: string
    campaignName?: string
  }>
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

const FALLBACK: AdminData = {
  generatedAtUtc: new Date().toISOString(),
  commandCenter: {
    activeResidents: 47,
    donationsLast30Count: 108,
    donationsLast30Amount: 42500,
    upcomingCaseConferences14d: 11,
    progressNotedRate30d: 74.5,
  },
  inactiveSupporterRisk: {
    activeSupporters: 120,
    highRiskCount: 18,
    mediumRiskCount: 41,
    lowRiskCount: 61,
    topAtRisk: [
      { supporterId: 101, displayName: 'Sample Supporter A', recencyDays: 204, frequency365: 1, channelCount365: 1, recurringShare365: 0, riskScore: 0.88, riskBand: 'High' },
      { supporterId: 102, displayName: 'Sample Supporter B', recencyDays: 176, frequency365: 1, channelCount365: 1, recurringShare365: 0, riskScore: 0.81, riskBand: 'High' },
      { supporterId: 103, displayName: 'Sample Supporter C', recencyDays: 149, frequency365: 2, channelCount365: 1, recurringShare365: 0, riskScore: 0.74, riskBand: 'High' },
    ],
  },
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [usersError, setUsersError] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [donationFilter, setDonationFilter] = useState('all')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ email: '', firstName: '', lastName: '', role: 'donor' })
  const [actionStatus, setActionStatus] = useState('')
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
      .then((json: AdminData) => {
        setData(json)
        setIsLoading(false)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(`Live API unavailable (${msg}). Showing fallback preview data from mock values.`)
        setData(FALLBACK)
        setIsLoading(false)
      })
  }, [apiUrl, token])

  function fetchUsers() {
    const params = new URLSearchParams()
    params.set('sort', sort)
    if (roleFilter !== 'all') params.set('role', roleFilter)
    if (search.trim()) params.set('q', search.trim())
    if (donationFilter !== 'all') params.set('donationFilter', donationFilter)

    fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((rows: UserRow[]) => {
        setUsers(rows)
        setUsersError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setUsersError(`User management unavailable: ${msg}`)
      })
  }

  useEffect(() => {
    fetchUsers()
  }, [sort, roleFilter, donationFilter, token])

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 300)
    return () => clearTimeout(t)
  }, [search])

  function openDetails(userId: string) {
    if (selectedUserId === userId) {
      setSelectedUserId(null)
      setSelectedUser(null)
      return
    }
    setSelectedUserId(userId)
    fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((detail: UserDetail) => setSelectedUser(detail))
      .catch(() => setSelectedUser(null))
  }

  function startEdit(user: UserRow) {
    setEditingUserId(user.id)
    setEditForm({
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.primaryRole || 'donor',
    })
  }

  async function saveEdit(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(editForm),
    })
    if (!response.ok) {
      setActionStatus('Failed to update user.')
      return
    }
    setEditingUserId(null)
    setActionStatus('User updated.')
    fetchUsers()
  }

  async function deleteUser(userId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this user account?')
    if (!confirmed) return

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) {
      setActionStatus('Failed to delete user.')
      return
    }
    setActionStatus('User deleted.')
    if (selectedUserId === userId) {
      setSelectedUserId(null)
      setSelectedUser(null)
    }
    fetchUsers()
  }

  const cc = data?.commandCenter

  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="mt-2 text-stone-600">
            Daily operations overview: resident capacity, donation flow, upcoming conferences, and inactive-supporter pipeline risk.
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Updated: {data ? new Date(data.generatedAtUtc).toLocaleString() : 'Loading...'}
          </p>
          <p className="mt-1 text-xs text-stone-400">API source: <code>{apiUrl}</code></p>
          {loadError && <p className="mt-2 text-sm text-amber-700">{loadError}</p>}
        </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {isLoading || !cc ? (
            <>
              <Kpi title="Active Residents" value="Loading..." />
              <Kpi title="Donations (30d)" value="Loading..." />
              <Kpi title="Donation Amount (30d)" value="Loading..." />
              <Kpi title="Case Conferences (14d)" value="Loading..." />
              <Kpi title="Progress Noted Rate (30d)" value="Loading..." />
            </>
          ) : (
            <>
              <Kpi title="Active Residents" value={cc.activeResidents.toLocaleString()} />
              <Kpi title="Donations (30d)" value={cc.donationsLast30Count.toLocaleString()} />
              <Kpi title="Donation Amount (30d)" value={`$${cc.donationsLast30Amount.toLocaleString()}`} />
              <Kpi title="Case Conferences (14d)" value={cc.upcomingCaseConferences14d.toLocaleString()} />
              <Kpi title="Progress Noted Rate (30d)" value={`${cc.progressNotedRate30d}%`} />
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">User Management</h2>
          <p className="mt-1 text-sm text-stone-600">View users, roles, donations, and manage accounts.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-3 text-sm">
              {['all', 'admin', 'staff', 'donor'].map((r) => (
                <label key={r} className="flex items-center gap-1">
                  <input type="radio" name="role-filter" checked={roleFilter === r} onChange={() => setRoleFilter(r)} />
                  {r}
                </label>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
              <option value="newest">Newest to oldest</option>
              <option value="oldest">Oldest to newest</option>
              <option value="donation-high">Donation high to low</option>
              <option value="donation-low">Donation low to high</option>
            </select>
            <select value={donationFilter} onChange={(e) => setDonationFilter(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
              <option value="all">All users</option>
              <option value="with">With donations</option>
              <option value="without">No donations</option>
            </select>
          </div>

          {actionStatus && <p className="mt-3 text-sm text-teal-700">{actionStatus}</p>}
          {usersError && <p className="mt-3 text-sm text-amber-700">{usersError}</p>}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-700">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Total Donations</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-stone-100">
                    <td className="py-2 pr-4">
                      <button onClick={() => openDetails(u.id)} className="text-left hover:underline">
                        {u.email}
                      </button>
                    </td>
                    <td className="py-2 pr-4">{u.primaryRole}</td>
                    <td className="py-2 pr-4">${u.totalDonations.toFixed(2)}</td>
                    <td className="py-2 pr-4">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2 flex gap-2">
                      <button onClick={() => startEdit(u)} className="rounded border border-stone-300 px-2 py-1 text-xs">Edit</button>
                      <button onClick={() => deleteUser(u.id)} className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingUserId && (
            <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-semibold text-stone-700">Edit user</p>
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="rounded border border-stone-300 px-2 py-1 text-sm" />
                <input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} placeholder="First name" className="rounded border border-stone-300 px-2 py-1 text-sm" />
                <input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} placeholder="Last name" className="rounded border border-stone-300 px-2 py-1 text-sm" />
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="rounded border border-stone-300 px-2 py-1 text-sm">
                  <option value="admin">admin</option>
                  <option value="staff">staff</option>
                  <option value="donor">donor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => saveEdit(editingUserId)} className="rounded bg-teal-600 px-3 py-1 text-xs font-semibold text-white">Save</button>
                <button onClick={() => setEditingUserId(null)} className="rounded border border-stone-300 px-3 py-1 text-xs">Cancel</button>
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-800">User details: {selectedUser.email}</p>
              <p className="mt-1 text-xs text-teal-700">Roles: {selectedUser.roles.join(', ')}</p>
              <p className="mt-1 text-xs text-teal-700">
                Supporter: {selectedUser.supporter ? `#${selectedUser.supporter.supporterId} (${selectedUser.supporter.status})` : 'not linked'}
              </p>
              <p className="mt-3 text-xs font-semibold text-teal-800">Recent donations</p>
              <ul className="mt-1 space-y-1 text-xs text-teal-900">
                {selectedUser.recentDonations.length === 0 && <li>No donations found.</li>}
                {selectedUser.recentDonations.map((d) => (
                  <li key={d.donationId}>
                    {d.donationDate} - ${d.amount ?? 0} ({d.donationType}) {d.campaignName ? `- ${d.campaignName}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-teal-700">{value}</p>
    </article>
  )
}
