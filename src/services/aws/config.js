export const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || ''
export const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1'
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const REQUEST_TIMEOUT_MS = 15000
export const MAX_RETRIES = 3

// Debug logging — visible in browser console on Vercel
console.log('[Config]', {
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  API_URL: API_GATEWAY_URL ? API_GATEWAY_URL.replace(/\/\/(.{8}).*(@|\.execute)/, '//$1...') : '(empty)',
  RESOLVED_DEMO: DEMO_MODE,
})
