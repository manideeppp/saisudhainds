import type { PageFrameStatus } from '../components/PageFrame'

export function resolveSeasonPageStatus(
  seasonLoading: boolean,
  seasonId: string | null,
  loading: boolean,
  error: string | null,
): PageFrameStatus {
  if (seasonLoading) return 'season-loading'
  if (!seasonId) return 'no-season'
  if (loading) return 'loading'
  if (error) return 'error'
  return 'ready'
}
