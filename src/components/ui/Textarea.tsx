import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={textareaId} className="text-sm font-medium text-forest-800">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={`w-full min-h-[88px] rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 shadow-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 resize-y ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
