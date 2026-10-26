import { useCallback, useEffect, useState } from 'react'

export function usePageLoad(loadFn: () => Promise<string | null | void>, enabled: boolean) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const err = await loadFn()
      if (err) setError(err)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [loadFn, enabled])

  useEffect(() => {
    reload()
  }, [reload])

  return { loading, error, reload }
}
