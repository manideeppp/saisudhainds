import { createClient } from '@supabase/supabase-js'
import { MILL_AUTH_EMAIL_SUFFIX } from './constants'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and add your Supabase credentials.',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
)

/** Maps mill username (e.g. mobile) to the Supabase Auth email. */
export function usernameToAuthEmail(username: string): string {
  const trimmed = username.trim()
  if (!trimmed) return ''
  if (trimmed.includes('@')) return trimmed
  return `${trimmed}${MILL_AUTH_EMAIL_SUFFIX}`
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
