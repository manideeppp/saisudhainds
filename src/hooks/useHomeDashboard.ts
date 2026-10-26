import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchSeasonMillData } from '../lib/season/seasonMillData'
import { buildHomeDashboard } from '../lib/home/buildHomeDashboard'
import { useSeason } from '../contexts/SeasonContext'
import type { ReceivableWithPayments } from '../types/database'
import type { SeasonOpeningStock } from '../types/season'

export function useHomeDashboard() {
  const { activeSeason, loading: seasonLoading } = useSeason()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [millData, setMillData] = useState<Awaited<ReturnType<typeof fetchSeasonMillData>> | null>(null)
  const [receivables, setReceivables] = useState<ReceivableWithPayments[]>([])
  const [opening, setOpening] = useState<SeasonOpeningStock | null>(null)
  const [riceProduced, setRiceProduced] = useState(0)

  const load = useCallback(async () => {
    if (!activeSeason) {
      setMillData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [data, recRes, millRes, openRes] = await Promise.all([
        fetchSeasonMillData(activeSeason.id),
        supabase
          .from('receivables')
          .select('*, receivable_payments(*)')
          .eq('season_id', activeSeason.id),
        supabase.from('rice_millings').select('rice_quintals').eq('season_id', activeSeason.id),
        supabase.from('season_opening_stocks').select('*').eq('season_id', activeSeason.id).maybeSingle(),
      ])
      if (recRes.error) throw new Error(recRes.error.message)
      setMillData(data)
      setReceivables((recRes.data ?? []) as ReceivableWithPayments[])
      const milled = (millRes.data ?? []).reduce((s, r) => s + Number(r.rice_quintals), 0)
      const delivered = data.rice.reduce((s, r) => s + Number(r.quintals), 0)
      setRiceProduced(milled > 0 ? milled : delivered)
      setOpening(openRes.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      setMillData(null)
    }
    setLoading(false)
  }, [activeSeason])

  useEffect(() => {
    if (!seasonLoading) load()
  }, [load, seasonLoading])

  const dashboard = useMemo(() => {
    if (!millData) return null
    return buildHomeDashboard(millData, receivables, opening, riceProduced)
  }, [millData, receivables, opening, riceProduced])

  return {
    seasonLoading,
    loading,
    error,
    reload: load,
    activeSeason,
    dashboard,
    isEmpty: !loading && millData && dashboard && millData.expenses.length === 0 && millData.farmer.length === 0,
  }
}
