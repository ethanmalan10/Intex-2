import { footerNavItems } from './navConfig'

export default function SiteFooter() {
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
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-6 border-t border-stone-800 text-center text-stone-600 text-xs leading-relaxed">
        BrighterPath is a registered nonprofit organization. All resident information is anonymized to protect privacy and safety.
      </div>
    </footer>
  )
}
