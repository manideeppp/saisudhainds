import { Navigate } from 'react-router-dom'

/** Legacy route — home is the primary dashboard. */
export function DashboardPage() {
  return <Navigate to="/home" replace />
}
