import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AppTopBar } from './layout/AppTopBar'
import { AppBreadcrumb } from './AppBreadcrumb'

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      <div className="app-shell-bg pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[17rem] lg:flex-col">
        <Sidebar />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[17rem]">
        <AppTopBar onOpenMenu={() => setMobileOpen(true)} />

        <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 lg:px-6 lg:py-8">
          <AppBreadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
