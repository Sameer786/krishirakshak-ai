import { useState, useEffect, useRef } from 'react'

export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const lastOnlineAtRef = useRef(navigator.onLine ? Date.now() : null)
  const [lastOnlineAt, setLastOnlineAt] = useState(lastOnlineAtRef.current)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      lastOnlineAtRef.current = Date.now()
      setLastOnlineAt(lastOnlineAtRef.current)
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, lastOnlineAt }
}
