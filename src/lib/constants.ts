import type { PaymentMode } from '../types/database'

export const PAYMENT_MODES: PaymentMode[] = [
  'Cash',
  'UPI',
  'Bank Transfer',
  'Cheque',
]

export const APP_NAME = 'Sai Sudha Rice Mill'
export const APP_SUBTITLE = 'Mill management, profit & reports'

/** Default mill login username (mobile). Supabase Auth user email = username + MILL_AUTH_EMAIL_SUFFIX */
export const MILL_LOGIN_USERNAME = '9515320303'
export const MILL_AUTH_EMAIL_SUFFIX = '@saisudhainds.local'

export const RICE_COMMUNITIES = [
  { value: 'B', label: 'B (Boiled)' },
  { value: 'R', label: 'R (Raw)' },
] as const

export type RiceCommunity = (typeof RICE_COMMUNITIES)[number]['value']

export const BYPRODUCT_TYPES = [
  'Bran / Thoudu',
  'Nookalu / Broken rice',
  'Param',
  'Husk',
  'Boodidha',
] as const

export type ByproductType = (typeof BYPRODUCT_TYPES)[number]

export const BYPRODUCT_NAV: { slug: string; label: string; type: ByproductType }[] = [
  { slug: 'bran', label: 'Bran / Thoudu', type: 'Bran / Thoudu' },
  { slug: 'nookalu', label: 'Nookalu / Broken rice', type: 'Nookalu / Broken rice' },
  { slug: 'param', label: 'Param', type: 'Param' },
  { slug: 'husk', label: 'Husk', type: 'Husk' },
  { slug: 'buddibha', label: 'Boodidha', type: 'Boodidha' },
]

export function byproductTypeFromSlug(slug: string): ByproductType | null {
  return BYPRODUCT_NAV.find((b) => b.slug === slug)?.type ?? null
}
