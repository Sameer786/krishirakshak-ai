import useOnlineStatus from '../../hooks/useOnlineStatus'

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-3">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isOnline ? 'bg-primary animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className={`text-xs font-medium ${isOnline ? 'text-primary-dark' : 'text-gray-500'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
      <span className="text-xs text-gray-400">|</span>
      <span className="text-xs text-gray-400">
        Last sync: Just now
      </span>
    </div>
  )
}
