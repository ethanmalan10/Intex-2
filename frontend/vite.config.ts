import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Document-level CSP for HTML served by Vite (dev + `vite preview`).
 * For production static hosting (Netlify, etc.), `public/_headers` mirrors a compatible policy.
 * Tighten `connect-src` there if your API origin is fixed.
 */
function buildSpaContentSecurityPolicy(env: Record<string, string>, mode: string): string {
  const apiBase = (env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  let apiOrigin = ''
  try {
    if (apiBase) apiOrigin = new URL(apiBase).origin
  } catch {
    /* ignore invalid URL */
  }

  const analyticsOrigins =
    'https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com'

  const devConnect =
    'http://127.0.0.1:5050 http://localhost:5050 http://127.0.0.1:5173 http://localhost:5173 ws://127.0.0.1:5173 ws://localhost:5173 wss://127.0.0.1:5173 wss://localhost:5173'

  const prodConnect = [apiOrigin, analyticsOrigins].filter(Boolean).join(' ').trim()

  const connectSrc =
    mode === 'development' ? `'self' ${devConnect} ${analyticsOrigins}` : `'self' ${prodConnect || analyticsOrigins}`

  const scriptSrc = mode === 'development' ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self'"

  const parts = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ]

  if (mode !== 'development') {
    parts.push('upgrade-insecure-requests')
  }

  return parts.join('; ')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const csp = buildSpaContentSecurityPolicy(env, mode)
  const documentSecurityHeaders = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  }

  return {
    plugins: [react(), tailwindcss()],
    preview: {
      port: 8080,
      host: '0.0.0.0',
      allowedHosts: ['intex-2-production.up.railway.app', 'all'],
      headers: documentSecurityHeaders,
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      headers: documentSecurityHeaders,
    },
  }
})
