import { useLocation, Navigate } from 'react-router-dom'
import { PageSuccess } from '../components/ui/PageState'

type SuccessState = {
  title?: string
  message?: string
  returnTo?: string
  returnLabel?: string
  listTo?: string
  listLabel?: string
}

export function SuccessPage() {
  const location = useLocation()
  const state = (location.state as SuccessState | null) ?? {}

  if (!state.title && !state.message) {
    return <Navigate to="/home" replace />
  }

  return (
    <PageSuccess
      title={state.title ?? 'Saved successfully'}
      message={state.message ?? 'Your changes have been recorded for this season.'}
      primaryLabel={state.returnLabel ?? 'Back to list'}
      primaryTo={state.returnTo ?? '/home'}
      secondaryLabel={state.listLabel}
      secondaryTo={state.listTo}
    />
  )
}
