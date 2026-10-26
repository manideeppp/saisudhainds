import type { ReactNode } from 'react'
import { useSeasonScope } from '../hooks/useSeasonScope'
import { PageHeader } from './PageHeader'

export function SeasonPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  const { activeSeason, isSeasonClosed } = useSeasonScope()
  const parts = [description, activeSeason?.name, isSeasonClosed ? 'View only' : null].filter(
    Boolean,
  )
  return <PageHeader title={title} description={parts.join(' · ')} action={action} />
}
