import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { breadcrumbForPath } from '../lib/navigation'

export function AppBreadcrumb() {
  const { pathname } = useLocation()
  const { parent, current } = breadcrumbForPath(pathname)

  if (pathname === '/home') return null

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-forest-500">
      {parent ? (
        <>
          <Link to={parent.to} className="font-medium hover:text-forest-800 transition">
            {parent.label}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-forest-300" aria-hidden />
        </>
      ) : null}
      <span className="font-semibold text-forest-800">{current}</span>
    </nav>
  )
}
