import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { APP_NAME } from '../lib/constants'

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ivory-50 lg:flex">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-forest-900/60"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-forest-100 bg-ivory-50/95 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="rounded-xl border border-forest-200 bg-white p-2 text-forest-800 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gold-600">
              Rice Mill Finance
            </p>
            <h1 className="text-lg font-bold text-forest-900">{APP_NAME}</h1>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
