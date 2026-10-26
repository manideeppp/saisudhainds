import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import { PageError, PageLoading } from './ui/PageState'

export type PageFrameStatus = 'season-loading' | 'no-season' | 'loading' | 'error' | 'ready'

export function PageFrame({
  status,
  loadingMessage = 'Loading…',
  errorMessage,
  onRetry,
  emptyTitle = 'No season',
  emptyDescription = 'Choose a season from the top bar or open the season screen.',
  emptyAction,
  children,
}: {
  status: PageFrameStatus
  loadingMessage?: string
  errorMessage?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  children: ReactNode
}) {
  if (status === 'season-loading' || status === 'loading') {
    return <PageLoading message={loadingMessage} />
  }
  if (status === 'no-season') {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    )
  }
  if (status === 'error' && errorMessage) {
    return <PageError message={errorMessage} onRetry={onRetry} />
  }
  return <>{children}</>
}
