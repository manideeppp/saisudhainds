import { Navigate, useLocation } from 'react-router-dom'
import { isSeasonEntered } from '../lib/season/session'
import { useSeason } from '../contexts/SeasonContext'
import { PageLoading } from './ui/PageState'

export function SeasonGate({ children }: { children: React.ReactNode }) {
  const { loading } = useSeason()
  const location = useLocation()

  if (loading) {
    return <PageLoading message="Loading seasons…" fullScreen />
  }

  if (!isSeasonEntered()) {
    return <Navigate to="/season" replace state={{ from: location.pathname }} />
  }

  return children
}
