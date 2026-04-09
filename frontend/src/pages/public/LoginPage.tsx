import { useState, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justRegistered = searchParams.get('registered') === '1'
  const returnUrlParam = searchParams.get('returnUrl')
  const safeReturnUrl =
    returnUrlParam &&
    /^\/(?!\/)/.test(returnUrlParam) &&
    !returnUrlParam.includes('://') &&
    !returnUrlParam.toLowerCase().startsWith('/\\')
      ? returnUrlParam
      : '/admin'

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    let valid = true
    setUsernameError('')
    setPasswordError('')
    setFormError('')

    if (!usernameOrEmail.trim()) {
      setUsernameError('Username or email is required.')
      valid = false
    }

    if (!password) {
      setPasswordError('Password is required.')
      valid = false
    }

    return valid
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      })

      if (!res.ok) {
        setFormError('Invalid username or password.')
        return
      }

      const data = await res.json()
      await login(data.token)
      navigate(safeReturnUrl)
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      role="main"
      aria-label="Sign in page"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAF7F2' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-100 px-8 py-10">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
          style={{ color: '#1F766E' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </a>

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-2xl font-bold" style={{ color: '#264653' }}>BrighterPath</p>
          <p className="text-sm text-stone-600 mt-1">Sign in to your account</p>
        </div>

        {/* Registration success */}
        {justRegistered && (
          <div
            className="mb-5 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#C6F6D5', color: '#276749' }}
          >
            Account created! Sign in below.
          </div>
        )}

        {/* Form error */}
        {formError && (
          <div
            className="mb-5 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#FED7D7', color: '#C53030' }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Username or Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold" style={{ color: '#264653' }}>
              Username or email
            </label>
            <input
              type="text"
              autoComplete="username"
              value={usernameOrEmail}
              onChange={e => setUsernameOrEmail(e.target.value)}
              placeholder="username or you@example.com"
              style={{
                border: `1.5px solid ${usernameError ? '#E53E3E' : '#CBD5E0'}`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                color: '#264653',
                outline: 'none',
                backgroundColor: 'white',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!usernameError) e.target.style.borderColor = '#2A9D8F' }}
              onBlur={e => { if (!usernameError) e.target.style.borderColor = '#CBD5E0' }}
            />
            {usernameError && (
              <p className="text-xs" style={{ color: '#E53E3E' }}>{usernameError}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold" style={{ color: '#264653' }}>
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                border: `1.5px solid ${passwordError ? '#E53E3E' : '#CBD5E0'}`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                color: '#264653',
                outline: 'none',
                backgroundColor: 'white',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!passwordError) e.target.style.borderColor = '#2A9D8F' }}
              onBlur={e => { if (!passwordError) e.target.style.borderColor = '#CBD5E0' }}
            />
            {passwordError && (
              <p className="text-xs" style={{ color: '#E53E3E' }}>{passwordError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#6bbdb5' : '#2A9D8F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              transition: 'background-color 0.15s',
            }}
          >
            {loading && (
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-600 mt-4">
          Don't have an account?{' '}
          <a href="/register" style={{ color: '#1F766E' }} className="font-medium hover:underline">
            Create one
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
