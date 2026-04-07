export type NavItem = {
  label: string
  landingHref: string
  defaultHref: string
}

export const primaryNavItems: NavItem[] = [
  { label: 'Our Impact', landingHref: '/impact-dashboard', defaultHref: '/impact-dashboard' },
  { label: 'Admin Dashboard', landingHref: '/admin-dashboard', defaultHref: '/admin-dashboard' },
  { label: 'Reports & Analytics', landingHref: '/reports-analytics', defaultHref: '/reports-analytics' },
  { label: 'Process Recording', landingHref: '/process-recording', defaultHref: '/process-recording' },
  {
    label: 'Home Visitation & Case Conferences',
    landingHref: '/home-visitation-case-conferences',
    defaultHref: '/home-visitation-case-conferences',
  },
  { label: 'Get Help', landingHref: '#get-help', defaultHref: '/#get-help' },
]

export const footerNavItems = [
  { label: 'Our Impact', href: '/impact-dashboard' },
  { label: 'Reports & Analytics', href: '/reports-analytics' },
  { label: 'Process Recording', href: '/process-recording' },
  { label: 'Home Visitation & Case Conferences', href: '/home-visitation-case-conferences' },
  { label: 'Get Help', href: '/#get-help' },
  { label: 'Our Story', href: '/#our-story' },
  { label: 'Donate', href: '/#donate' },
  { label: 'Privacy Notice', href: '/privacy-notice' },
]
