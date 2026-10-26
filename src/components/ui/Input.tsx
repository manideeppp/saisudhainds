import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-forest-800">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 shadow-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
