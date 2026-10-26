import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-forest-700 text-white hover:bg-forest-800 border border-forest-800 shadow-sm',
  secondary:
    'bg-white text-forest-800 hover:bg-ivory-100 border border-forest-200 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-700',
  ghost: 'bg-transparent text-forest-700 hover:bg-forest-50 border border-transparent',
}

export function Button({
  variant = 'primary',
  loading,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
}
