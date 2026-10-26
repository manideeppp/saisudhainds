import { PageLoading } from './PageState'

export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return <PageLoading message={message} />
}
