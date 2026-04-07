import type { ReactNode } from 'react'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'

type PublicLayoutProps = {
  children: ReactNode
  navVariant?: 'landing' | 'default'
  offsetTop?: boolean
  showFooter?: boolean
}

export default function PublicLayout({
  children,
  navVariant = 'default',
  offsetTop = true,
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <div className="font-sans antialiased text-stone-700">
      <SiteHeader variant={navVariant} />
      <main className={offsetTop ? 'pt-20' : ''}>{children}</main>
      {showFooter ? <SiteFooter /> : null}
    </div>
  )
}
