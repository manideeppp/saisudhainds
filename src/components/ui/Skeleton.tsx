export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-forest-100/80 ${className}`} aria-hidden />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  )
}
