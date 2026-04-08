import { useEffect, useState } from 'react'
<<<<<<< HEAD
import { adminViewItems, primaryNavItems } from './navConfig'
=======
import { useNavigate } from 'react-router-dom'
import { primaryNavItems } from './navConfig'
>>>>>>> e1d06583a4af1d324ffb8bab844f6747a5438beb
import { useAuth } from '../../context/AuthContext'

type SiteNavProps = {
  variant: 'landing' | 'default'
}

export default function SiteNav({ variant }: SiteNavProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
<<<<<<< HEAD
  const [adminOpen, setAdminOpen] = useState(false)
  const { user } = useAuth()
=======
  const { user, logout } = useAuth()
  const navigate = useNavigate()
>>>>>>> e1d06583a4af1d324ffb8bab844f6747a5438beb
  const isAdmin = (user?.roles ?? []).some((r) => r.toLowerCase() === 'admin')
  const navItems = primaryNavItems

  useEffect(() => {
    if (variant !== 'landing') return
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [variant])

  const isOpaque = variant === 'default' || scrolled
  const containerClass = isOpaque
    ? 'bg-white/95 backdrop-blur shadow-sm border-b border-stone-100'
    : 'bg-transparent'
  const brandClass = isOpaque ? 'text-teal-700' : 'text-white'
  const linkClass = isOpaque ? 'text-stone-600' : 'text-white/80'
  const burgerClass = isOpaque ? 'bg-stone-600' : 'bg-white'
  const welcomeName = user?.firstName?.trim() || user?.email?.split('@')[0] || 'User'
  const logoutClass = isOpaque ? 'text-stone-500 hover:text-teal-600' : 'text-white/80 hover:text-white'

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${containerClass}`}>
      <div className="w-full px-4 py-4 lg:px-8 flex items-center justify-between">
        <a href="/" className={`text-xl font-bold tracking-tight transition-colors duration-300 ${brandClass} flex items-center gap-2`}>
          <img src="/logo.png" alt="BrighterPath logo" className="h-8 w-8 rounded-full object-cover" />
          <span>BrighterPath</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium ml-auto">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.label === 'Get Help' ? (
                  <a
                    href={variant === 'landing' ? item.landingHref : item.defaultHref}
                    className="rounded-full border border-rose-300 bg-rose-100 px-4 py-2 font-semibold text-rose-700 transition-colors hover:bg-rose-200"
                  >
                    {item.label}
                  </a>
                ) : (
                  <a
                    href={variant === 'landing' ? item.landingHref : item.defaultHref}
                    className={`transition-colors hover:text-teal-400 ${linkClass}`}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
            {isAdmin ? (
              <li className="relative">
                <button
                  type="button"
                  className={`transition-colors hover:text-teal-400 ${linkClass} flex items-center gap-1`}
                  onClick={() => setAdminOpen((v) => !v)}
                >
                  Admin View <span aria-hidden="true">▾</span>
                </button>
                {adminOpen ? (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                    {adminViewItems.map((item) => (
                      <a
                        key={item.label}
                        href={variant === 'landing' ? item.landingHref : item.defaultHref}
                        className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-teal-700"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </li>
            ) : null}
          </ul>
          <div className="flex items-center gap-5">
            {user ? (
              <div className="flex items-center gap-3">
                <span className={linkClass}>Welcome, {welcomeName}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`text-sm transition-colors ${logoutClass}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <a href="/login" className={`transition-colors hover:text-teal-400 ${linkClass}`}>
                Login
              </a>
            )}
            <a
              href="/donate"
              className="px-5 py-2 rounded-full bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors shadow-md"
            >
              Donate
            </a>
          </div>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block w-6 h-0.5 transition-all duration-300 ${burgerClass}
                ${i === 0 && open ? 'rotate-45 translate-y-2' : ''}
                ${i === 1 && open ? 'opacity-0' : ''}
                ${i === 2 && open ? '-rotate-45 -translate-y-2' : ''}`}
            />
          ))}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 pb-5 pt-3 flex flex-col gap-4 text-stone-600 text-sm font-medium">
          {navItems.map((item) => (
            item.label === 'Get Help' ? (
              <a
                key={item.label}
                href={variant === 'landing' ? item.landingHref : item.defaultHref}
                onClick={() => setOpen(false)}
                className="self-start rounded-full border border-rose-300 bg-rose-100 px-4 py-2 font-semibold text-rose-700"
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href={variant === 'landing' ? item.landingHref : item.defaultHref}
                onClick={() => setOpen(false)}
                className="hover:text-teal-700"
              >
                {item.label}
              </a>
            )
          ))}
          {isAdmin ? (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Admin View</p>
              <div className="mt-2 flex flex-col gap-2">
                {adminViewItems.map((item) => (
                  <a
                    key={item.label}
                    href={variant === 'landing' ? item.landingHref : item.defaultHref}
                    onClick={() => setOpen(false)}
                    className="hover:text-teal-700"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          {user ? (
            <div className="flex items-center gap-3">
              <span>Welcome, {welcomeName}</span>
              <button type="button" onClick={handleLogout} className="text-sm text-stone-500 hover:text-teal-700">
                Logout
              </button>
            </div>
          ) : (
            <a href="/login" onClick={() => setOpen(false)} className="hover:text-teal-700">
              Login
            </a>
          )}
          <a
            href="/donate"
            onClick={() => setOpen(false)}
            className="self-start px-5 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            Donate
          </a>
        </div>
      )}
    </nav>
  )
}
