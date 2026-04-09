import { footerNavItems } from './navConfig'

export default function SiteFooter() {
  const socialLinks = [
    {
      label: 'Website',
      href: 'https://www.lighthousesanctuary.org/',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20Zm6.93 9h-3.09a15.7 15.7 0 0 0-1.43-5.12A8.03 8.03 0 0 1 18.93 11Zm-6.93 11c-.9 0-2.37-1.84-3.03-5h6.06c-.66 3.16-2.13 5-3.03 5Zm-3.29-7A24.8 24.8 0 0 1 8.5 12c0-1.04.08-2.04.21-3h6.58c.13.96.21 1.96.21 3c0 1.04-.08 2.04-.21 3H8.71Zm-5.64-4a8.03 8.03 0 0 1 4.52-5.12A15.7 15.7 0 0 0 6.16 11H3.07Zm0 2h3.09c.23 1.87.72 3.62 1.43 5.12A8.03 8.03 0 0 1 3.07 13Zm11.34 5.12c.71-1.5 1.2-3.25 1.43-5.12h3.09a8.03 8.03 0 0 1-4.52 5.12ZM12 4c.9 0 2.37 1.84 3.03 5H8.97C9.63 5.84 11.1 4 12 4Z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/LighthouseSanctuary',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.85c0-2.5 1.49-3.88 3.77-3.88c1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      ),
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@LighthouseSanctuary',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.37.57A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.13 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.37-.57a3.02 3.02 0 0 0 2.13-2.13C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.6 15.57V8.43L15.83 12L9.6 15.57Z" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="bg-stone-900 px-6 pt-6 pb-4">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 mb-6">
        <div>
          <p className="text-xl font-bold text-teal-500 mb-3">BrighterPath</p>
          <p className="text-stone-500 text-sm leading-relaxed">
            Safe homes, healing, and reintegration for survivors of abuse and trafficking in Brazil.
          </p>
        </div>
        <div>
          <p className="text-stone-400 font-semibold text-xs uppercase tracking-wider mb-4">Navigate</p>
          <ul className="grid grid-cols-1 gap-y-2 text-stone-500 text-sm md:grid-cols-2 md:gap-x-8 md:gap-y-2">
            {footerNavItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="hover:text-teal-400 transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-stone-400 font-semibold text-xs uppercase tracking-wider mb-4">Contact</p>
          <ul className="flex flex-col gap-2 text-stone-500 text-sm">
            <li>contact@brighterpath.org</li>
            <li>+55 11 99999-9999</li>
            <li>Sao Paulo, Brazil</li>
          </ul>
          <div className="mt-4 flex items-center gap-3 text-stone-400">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                className="rounded-md p-1.5 transition-colors hover:text-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-5 border-t border-stone-800 text-center text-stone-600 text-xs leading-relaxed">
        BrighterPath is a registered nonprofit organization. All resident information is anonymized to protect privacy and safety.
      </div>
    </footer>
  )
}
