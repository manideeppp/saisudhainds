import type { SeasonOpeningStock } from '../../types/season'
import type { MillRawData } from '../mill/millData'

export interface StockBalances {
  paddy_quintals: number
  rice_quintals: number
  gunny_count: number
}

/** Paddy stock = opening + intake − estimated paddy milled (from milling records or rice out / outturn). */
export function computeStockSimple(
  opening: SeasonOpeningStock | null,
  data: MillRawData,
  riceProducedQtl: number,
  gunnyDispatches: { gunny_count: number }[],
): StockBalances {
  const openPaddy = Number(opening?.paddy_quintals ?? 0)
  const openRice = Number(opening?.rice_quintals ?? 0)
  const openGunny = Number(opening?.gunny_count ?? 0)

  const paddyIn =
    data.farmer.reduce((s, r) => s + Number(r.quintals), 0) +
    data.ikp.reduce((s, r) => s + Number(r.grade_a_quintals) + Number(r.common_quintals), 0)

  const paddyMilled = riceProducedQtl > 0 ? riceProducedQtl / 0.68 : 0 // default outturn ~68%
  const riceOut = data.rice.reduce((s, r) => s + Number(r.quintals), 0)

  const gunnyIn = data.ikp.reduce((s, r) => s + Number(r.gunny_old) + Number(r.gunny_new), 0)
  const gunnyOut = gunnyDispatches.reduce((s, g) => s + Number(g.gunny_count), 0)

  return {
    paddy_quintals: Math.max(0, openPaddy + paddyIn - paddyMilled),
    rice_quintals: Math.max(0, openRice + riceProducedQtl - riceOut),
    gunny_count: Math.max(0, openGunny + gunnyIn - gunnyOut),
  }
}

export function outturnPercent(paddyReceivedQtl: number, riceProducedQtl: number): number {
  if (paddyReceivedQtl <= 0) return 0
  return Math.round((riceProducedQtl / paddyReceivedQtl) * 1000) / 10
}
