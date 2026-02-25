import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ---------------------------------------------------------------------------
// Service Worker Registration
// ---------------------------------------------------------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates
        registration.onupdatefound = () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.onstatechange = () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              console.log('[SW] New version available')
            }
          }
        }
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err)
      })
  })
}
