import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isSeasonEntered } from '../lib/season/session'
import { User, Wheat } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { APP_NAME, MILL_LOGIN_USERNAME } from '../lib/constants'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { session, signIn, configured } = useAuth()
  const [username, setUsername] = useState(MILL_LOGIN_USERNAME)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) {
    return <Navigate to={isSeasonEntered() ? '/home' : '/season'} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!username.trim()) {
      setError('Please enter your username.')
      return
    }
    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }
    setLoading(true)
    const result = await signIn(username, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-forest-900 via-forest-800 to-forest-900 px-4">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-gold-400 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-forest-400 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-ivory-50 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-800 text-gold-300 shadow-lg">
            <Wheat className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-forest-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-forest-600">Secure expense & receivables portal</p>
        </div>

        {!configured ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Add your Supabase keys to <code className="text-xs">.env</code> (see{' '}
            <code className="text-xs">.env.example</code>) before signing in.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder="Mobile / username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" className="w-full" loading={loading}>
            <User className="h-4 w-4" />
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-forest-500">
          Authorized staff only. Contact the mill owner if you need access.
        </p>
      </div>
    </div>
  )
}
