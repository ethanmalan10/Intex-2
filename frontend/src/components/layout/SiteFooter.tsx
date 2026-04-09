import { footerNavItems } from './navConfig'
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6'

export default function SiteFooter() {
  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://instagram.com/',
      icon: <FaInstagram className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com/',
      icon: <FaFacebookF className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: 'X',
      href: 'https://x.com/',
      icon: <FaXTwitter className="h-5 w-5" aria-hidden="true" />,
    },
  ]

  return (
    <footer className="bg-stone-900 px-6 py-12">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 mb-8">
        <div>
          <p className="text-xl font-bold text-teal-500 mb-3">BrighterPath</p>
          <p className="text-stone-500 text-sm leading-relaxed">
            Safe homes, healing, and reintegration for survivors of abuse and trafficking in Brazil.
          </p>
        </div>
        <div>
          <p className="text-stone-400 font-semibold text-xs uppercase tracking-wider mb-4">Navigate</p>
          <ul className="flex flex-col gap-2 text-stone-500 text-sm">
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
      <div className="max-w-6xl mx-auto pt-6 border-t border-stone-800 text-center text-stone-600 text-xs leading-relaxed">
        BrighterPath is a registered nonprofit organization. All resident information is anonymized to protect privacy and safety.
      </div>
    </footer>
  )
}
