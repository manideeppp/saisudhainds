import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageFrame } from './PageFrame'
import { Button } from './ui/Button'
import { resolveSeasonPageStatus } from '../hooks/useSeasonPageStatus'

export function SeasonPageShell({
  seasonLoading,
  seasonId,
  loading,
  error,
  onRetry,
  loadingMessage = 'Loading…',
  children,
}: {
  seasonLoading: boolean
  seasonId: string | null
  loading: boolean
  error?: string | null
  onRetry?: () => void
  loadingMessage?: string
  children: ReactNode
}) {
  const status = resolveSeasonPageStatus(seasonLoading, seasonId, loading, error ?? null)
  return (
    <PageFrame
      status={status}
      loadingMessage={loadingMessage}
      errorMessage={error}
      onRetry={onRetry}
      emptyTitle="No season selected"
      emptyDescription="Choose a season to view and add entries for that period."
      emptyAction={
        <Link to="/season">
          <Button type="button">Choose season</Button>
        </Link>
      }
    >
      {children}
    </PageFrame>
  )
}
