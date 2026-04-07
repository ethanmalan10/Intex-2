import SiteNav from './SiteNav'

type SiteHeaderProps = {
  variant: 'landing' | 'default'
}

export default function SiteHeader({ variant }: SiteHeaderProps) {
  return <SiteNav variant={variant} />
}
