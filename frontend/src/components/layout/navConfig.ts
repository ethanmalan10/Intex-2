export type NavItem = {
  label: string
  landingHref: string
  defaultHref: string
}

export const primaryNavItems: NavItem[] = [
  { label: 'Our Impact', landingHref: '/impact-dashboard', defaultHref: '/impact-dashboard' },
  { label: 'Get Help', landingHref: '#get-help', defaultHref: '/#get-help' },
]

export const adminViewItems: NavItem[] = [
  { label: 'Admin Dashboard', landingHref: '/admin', defaultHref: '/admin' },
  { label: 'Donors & Contributions', landingHref: '/donors-contributions', defaultHref: '/donors-contributions' },
  { label: 'Residents', landingHref: '/caseload-inventory', defaultHref: '/caseload-inventory' },
  { label: 'Counseling', landingHref: '/process-recording', defaultHref: '/process-recording' },
  { label: 'Home Visitation & Case Conferences', landingHref: '/home-visitation-case-conferences', defaultHref: '/home-visitation-case-conferences' },
  { label: 'Reports & Analytics', landingHref: '/reports-analytics', defaultHref: '/reports-analytics' },
]

export const footerNavItems = [
  { label: 'Our Impact', href: '/impact-dashboard' },
  { label: 'Residents', href: '/caseload-inventory' },
  { label: 'Reports & Analytics', href: '/reports-analytics' },
  { label: 'Counseling', href: '/process-recording' },
  { label: 'Home Visitation & Case Conferences', href: '/home-visitation-case-conferences' },
  { label: 'Get Help', href: '/#get-help' },
  { label: 'Our Story', href: '/#our-story' },
  { label: 'Donate', href: '/donate' },
  { label: 'Privacy Notice', href: '/privacy-notice' },
]
