import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase, usernameToAuthEmail } from '../lib/supabase'
import { clearSeasonEntered } from '../lib/season/session'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  configured: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    if (!configured) {
      return {
        error:
          'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      }
    }

    const email = usernameToAuthEmail(username)
    if (!email) {
      return { error: 'Please enter your username.' }
    }

    // Clear this before Supabase publishes the new session. The auth listener can
    // render LoginPage as soon as the session changes, so clearing afterward can
    // briefly send a freshly signed-in user straight to the previous season.
    clearSeasonEntered()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }, [configured])

  const signOut = useCallback(async () => {
    clearSeasonEntered()
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({ session, loading, signIn, signOut, configured }),
    [session, loading, signIn, signOut, configured],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
