import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  const selectId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-forest-800">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 shadow-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
