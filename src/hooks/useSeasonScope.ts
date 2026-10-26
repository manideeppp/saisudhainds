import { useSeason } from '../contexts/SeasonContext'

export function useSeasonScope() {
  const { activeSeason, loading, isSeasonClosed } = useSeason()
  return {
    seasonId: activeSeason?.id ?? null,
    activeSeason,
    seasonLoading: loading,
    isSeasonClosed,
  }
}
