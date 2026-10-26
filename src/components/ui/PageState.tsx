import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Home, RefreshCw, Wheat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { APP_NAME } from '../../lib/constants'

export function PageLoading({
  message = 'Loading…',
  fullScreen = false,
}: {
  message?: string
  fullScreen?: boolean
}) {
  const wrap = fullScreen ? 'min-h-screen' : 'min-h-[50vh]'
  return (
    <div className={`flex ${wrap} flex-col items-center justify-center gap-4 px-4`}>
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-forest-100 border-t-forest-700" />
        <Wheat className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-gold-500" />
      </div>
      <p className="text-sm font-medium text-forest-700">{message}</p>
      <p className="text-xs text-forest-500">Please wait a moment</p>
    </div>
  )
}

export function PageError({
  title = 'Something went wrong',
  message,
  onRetry,
  homeTo = '/home',
}: {
  title?: string
  message: string
  onRetry?: () => void
  homeTo?: string
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg shadow-forest-900/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-forest-900">{title}</h2>
        <p className="mt-2 text-sm text-forest-600">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {onRetry ? (
            <Button type="button" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          ) : null}
          <Link to={homeTo}>
            <Button type="button" variant="secondary" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function PageSuccess({
  title,
  message,
  primaryLabel = 'Continue',
  primaryTo,
  onPrimary,
  secondaryLabel,
  secondaryTo,
}: {
  title: string
  message: string
  primaryLabel?: string
  primaryTo?: string
  onPrimary?: () => void
  secondaryLabel?: string
  secondaryTo?: string
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-forest-100 bg-white p-8 text-center shadow-lg shadow-forest-900/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
          <CheckCircle2 className="h-8 w-8 text-forest-600" />
        </div>
        <h2 className="text-xl font-bold text-forest-900">{title}</h2>
        <p className="mt-2 text-sm text-forest-600">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {primaryTo ? (
            <Link to={primaryTo}>
              <Button className="w-full sm:w-auto">{primaryLabel}</Button>
            </Link>
          ) : onPrimary ? (
            <Button type="button" onClick={onPrimary}>{primaryLabel}</Button>
          ) : null}
          {secondaryTo && secondaryLabel ? (
            <Link to={secondaryTo}>
              <Button type="button" variant="secondary" className="w-full sm:w-auto">
                {secondaryLabel}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function BrandedShell({
  children,
  subtitle,
}: {
  children: ReactNode
  subtitle?: string
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-forest-900 via-forest-800 to-forest-900">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-gold-400 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-400 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
        <header className="mb-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Wheat className="h-7 w-7 text-gold-300" />
          </div>
          <h1 className="text-xl font-bold">{APP_NAME}</h1>
          {subtitle ? <p className="mt-1 text-sm text-forest-100/90">{subtitle}</p> : null}
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
