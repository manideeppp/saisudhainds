import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Season } from '../types/season'

const STORAGE_KEY = 'saisudha_active_season_id'

interface SeasonContextValue {
  seasons: Season[]
  activeSeason: Season | null
  setActiveSeasonId: (id: string) => void
  refreshSeasons: () => Promise<void>
  loading: boolean
  isSeasonClosed: boolean
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [activeSeasonId, setActiveSeasonIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  )
  const [loading, setLoading] = useState(true)

  const refreshSeasons = useCallback(async () => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      console.error(error)
      setSeasons([])
      setLoading(false)
      return
    }

    const list = (data ?? []) as Season[]
    setSeasons(list)

    if (list.length === 0) {
      setActiveSeasonIdState(null)
      localStorage.removeItem(STORAGE_KEY)
      setLoading(false)
      return
    }

    const stored = activeSeasonId ?? localStorage.getItem(STORAGE_KEY)
    const valid = stored && list.some((s) => s.id === stored)
    const active = list.find((s) => s.status === 'active')
    const nextId = valid ? stored! : (active?.id ?? list[0].id)

    setActiveSeasonIdState(nextId)
    localStorage.setItem(STORAGE_KEY, nextId)
    setLoading(false)
  }, [activeSeasonId])

  useEffect(() => {
    refreshSeasons()
  }, [refreshSeasons])

  const setActiveSeasonId = useCallback((id: string) => {
    setActiveSeasonIdState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [])

  const activeSeason = useMemo(
    () => seasons.find((s) => s.id === activeSeasonId) ?? null,
    [seasons, activeSeasonId],
  )

  const value = useMemo(
    () => ({
      seasons,
      activeSeason,
      setActiveSeasonId,
      refreshSeasons,
      loading,
      isSeasonClosed: activeSeason?.status === 'closed',
    }),
    [seasons, activeSeason, setActiveSeasonId, refreshSeasons, loading],
  )

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
}

export function useSeason() {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within SeasonProvider')
  return ctx
}
