import { useState, useEffect, useCallback, useRef } from 'react'

export default function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const deferredPromptRef = useRef(null)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      deferredPromptRef.current = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = useCallback(async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return false

    prompt.prompt()
    const { outcome } = await prompt.userChoice
    deferredPromptRef.current = null
    setCanInstall(false)

    return outcome === 'accepted'
  }, [])

  const dismissInstall = useCallback(() => {
    setCanInstall(false)
  }, [])

  return { canInstall, isInstalled, installApp, dismissInstall }
}
