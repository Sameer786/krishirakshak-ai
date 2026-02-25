const SIZES = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
}

export default function LoadingSpinner({ size = 'md', label, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${SIZES[size] || SIZES.md} rounded-full border-primary/20 border-t-primary animate-spin`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className="text-sm text-gray-500">{label}</p>
      )}
    </div>
  )
}
