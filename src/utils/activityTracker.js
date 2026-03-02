const ACTIVITY_KEY = 'krishirakshak_recent_activity'
const MAX_ACTIVITIES = 10

/**
 * Add an activity to recent activity log.
 * @param {'voice'|'hazard'|'checklist'} type
 * @param {string} title
 * @param {string} subtitle
 */
export function addActivity(type, title, subtitle) {
  try {
    const existing = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]')
    const entry = { type, title, subtitle, timestamp: Date.now() }
    const updated = [entry, ...existing].slice(0, MAX_ACTIVITIES)
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated))
  } catch {
    /* quota exceeded — silently ignore */
  }
}

/**
 * Get all recent activities (newest first).
 * @returns {Array<{type: string, title: string, subtitle: string, timestamp: number}>}
 */
export function getActivities() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * Clear all recent activities.
 */
export function clearActivities() {
  localStorage.removeItem(ACTIVITY_KEY)
}

/**
 * Format a timestamp into a human-friendly relative string.
 * @param {number} timestamp — Date.now() value
 * @returns {string}
 */
export function formatTimeAgo(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
