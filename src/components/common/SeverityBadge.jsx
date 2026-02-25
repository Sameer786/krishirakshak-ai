const STYLES = {
  CRITICAL: 'bg-red-100 text-red-700 ring-red-200 animate-pulse-subtle',
  HIGH: 'bg-orange-100 text-orange-700 ring-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  LOW: 'bg-blue-100 text-blue-700 ring-blue-200',
}

const DOTS = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
}

const LABELS_HI = {
  CRITICAL: 'गंभीर',
  HIGH: 'उच्च',
  MEDIUM: 'मध्यम',
  LOW: 'कम',
}

export default function SeverityBadge({ severity, showHindi = false, className = '' }) {
  const key = severity?.toUpperCase() || 'LOW'

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1',
        STYLES[key] || STYLES.LOW,
        className,
      ].join(' ')}
    >
      <span className={`w-2 h-2 rounded-full ${DOTS[key] || DOTS.LOW}`} />
      {key}
      {showHindi && LABELS_HI[key] && (
        <span className="opacity-70 font-normal">({LABELS_HI[key]})</span>
      )}
    </span>
  )
}
