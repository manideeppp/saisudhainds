export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-forest-700">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest-200 border-t-forest-700" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
