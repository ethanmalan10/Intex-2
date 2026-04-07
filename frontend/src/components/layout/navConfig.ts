export type NavItem = {
  label: string
  landingHref: string
  defaultHref: string
}

export const primaryNavItems: NavItem[] = [
  { label: 'Our Impact', landingHref: '/impact-dashboard', defaultHref: '/impact-dashboard' },
  { label: 'Get Help', landingHref: '#get-help', defaultHref: '/#get-help' },
  { label: 'Our Story', landingHref: '#our-story', defaultHref: '/#our-story' },
]

export const footerNavItems = [
  { label: 'Our Impact', href: '/impact-dashboard' },
  { label: 'Get Help', href: '/#get-help' },
  { label: 'Our Story', href: '/#our-story' },
  { label: 'Donate', href: '/#donate' },
  { label: 'Privacy Notice', href: '/privacy-notice' },
]
