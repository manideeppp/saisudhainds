export type SeasonType = 'Kharif' | 'Rabi'
export type SeasonStatus = 'active' | 'closed'

export interface Season {
  id: string
  name: string
  season_type: SeasonType
  start_date: string
  end_date: string
  status: SeasonStatus
  created_at: string
  updated_at: string
}

export interface SeasonOpeningStock {
  season_id: string
  paddy_quintals: number
  rice_quintals: number
  gunny_count: number
  updated_at: string
}

export interface RiceMilling {
  id: string
  season_id: string
  milling_date: string
  paddy_quintals: number
  rice_quintals: number
  notes: string
  created_at: string
  updated_at: string
}
