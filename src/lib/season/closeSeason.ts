import { supabase } from '../supabase'
import { receivableMetrics } from '../format'
import type { Season, SeasonType } from '../../types/season'
import { fetchSeasonMillData } from './seasonMillData'
import { computeStockSimple } from './stockMetrics'

export interface CloseSeasonInput {
  closingSeasonId: string
  nextName: string
  nextType: SeasonType
  nextStart: string
  nextEnd: string
}

export async function closeSeasonAndOpenNext(input: CloseSeasonInput): Promise<Season> {
  const { closingSeasonId, nextName, nextType, nextStart, nextEnd } = input

  const { data: closing, error: closeErr } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', closingSeasonId)
    .single()

  if (closeErr || !closing) throw new Error(closeErr?.message ?? 'Season not found')
  if (closing.status === 'closed') throw new Error('Season is already closed')

  const millData = await fetchSeasonMillData(closingSeasonId)
  const { data: millings } = await supabase
    .from('rice_millings')
    .select('rice_quintals')
    .eq('season_id', closingSeasonId)

  const riceFromMilling = (millings ?? []).reduce((s, m) => s + Number(m.rice_quintals), 0)
  const riceProduced =
    riceFromMilling > 0
      ? riceFromMilling
      : millData.rice.reduce((s, r) => s + Number(r.quintals), 0)

  const { data: openingRow } = await supabase
    .from('season_opening_stocks')
    .select('*')
    .eq('season_id', closingSeasonId)
    .maybeSingle()

  const closingStock = computeStockSimple(
    openingRow,
    millData,
    riceProduced,
    millData.gunny,
  )

  const { data: receivables, error: recErr } = await supabase
    .from('receivables')
    .select('*, receivable_payments(*)')
    .eq('season_id', closingSeasonId)

  if (recErr) throw new Error(recErr.message)

  const { error: closeUpdateErr } = await supabase
    .from('seasons')
    .update({ status: 'closed' })
    .eq('id', closingSeasonId)

  if (closeUpdateErr) throw new Error(closeUpdateErr.message)

  const { data: newSeason, error: newErr } = await supabase
    .from('seasons')
    .insert({
      name: nextName,
      season_type: nextType,
      start_date: nextStart,
      end_date: nextEnd,
      status: 'active',
    })
    .select()
    .single()

  if (newErr || !newSeason) throw new Error(newErr?.message ?? 'Failed to create next season')

  const { error: stockErr } = await supabase.from('season_opening_stocks').insert({
    season_id: newSeason.id,
    paddy_quintals: closingStock.paddy_quintals,
    rice_quintals: closingStock.rice_quintals,
    gunny_count: closingStock.gunny_count,
  })

  if (stockErr) throw new Error(stockErr.message)

  for (const r of receivables ?? []) {
    const m = receivableMetrics(
      Number(r.amount_due),
      r.receivable_payments ?? [],
      r.due_date,
    )
    if (m.outstanding <= 0.009) continue

    const { error: carryErr } = await supabase.from('receivables').insert({
      season_id: newSeason.id,
      date_given: r.due_date,
      party_name: r.party_name,
      details: `Carried forward: ${r.details}`.trim(),
      amount_due: m.outstanding,
      due_date: r.due_date,
      notes: r.notes,
      carried_from_id: r.id,
    })
    if (carryErr) throw new Error(carryErr.message)
  }

  return newSeason as Season
}
