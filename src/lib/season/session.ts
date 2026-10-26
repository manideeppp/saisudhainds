export const SEASON_ENTERED_KEY = 'saisudha_season_entered'

export function isSeasonEntered(): boolean {
  return localStorage.getItem(SEASON_ENTERED_KEY) === '1'
}

export function markSeasonEntered(): void {
  localStorage.setItem(SEASON_ENTERED_KEY, '1')
}

export function clearSeasonEntered(): void {
  localStorage.removeItem(SEASON_ENTERED_KEY)
}
