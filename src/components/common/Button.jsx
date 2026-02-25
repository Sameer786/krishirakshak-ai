import { useCallback, useRef } from 'react'

const VARIANTS = {
  primary: 'bg-primary text-white shadow-md hover:bg-primary-dark focus-visible:ring-primary/50',
  secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary focus-visible:ring-gray-300',
  danger: 'bg-red-600 text-white shadow-md hover:bg-red-700 focus-visible:ring-red-400/50',
}

const SIZES = {
  sm: 'px-3 py-2 text-sm min-h-[36px] rounded-lg gap-1.5',
  md: 'px-4 py-3 text-base min-h-[48px] rounded-xl gap-2',
  lg: 'px-5 py-4 text-lg min-h-[56px] rounded-2xl gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  type = 'button',
  ...rest
}) {
  const btnRef = useRef(null)

  const handleClick = useCallback(
    (e) => {
      if (loading || disabled) return

      // Ripple effect
      const btn = btnRef.current
      if (btn) {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const ripple = document.createElement('span')
        ripple.className = 'btn-ripple'
        ripple.style.left = `${x}px`
        ripple.style.top = `${y}px`
        btn.appendChild(ripple)
        setTimeout(() => ripple.remove(), 600)
      }

      onClick?.(e)
    },
    [onClick, loading, disabled],
  )

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={[
        'relative overflow-hidden inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && (
        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  )
}
