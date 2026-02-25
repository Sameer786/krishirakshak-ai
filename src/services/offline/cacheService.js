const CACHE_KEY = 'krishirakshak_qa_cache'
const MAX_ITEMS = 50
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || []
  } catch {
    return []
  }
}

function writeCache(items) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

/**
 * Save a Q&A pair to the offline cache.
 */
export function saveQAToCache(question, answer, language, sources = [], confidence = 0) {
  const cache = readCache()

  // Deduplicate: remove existing entry with same question
  const filtered = cache.filter(
    (item) => item.question.toLowerCase() !== question.toLowerCase()
  )

  filtered.unshift({
    question,
    answer,
    language,
    sources,
    confidence,
    cachedAt: Date.now(),
  })

  writeCache(filtered)
}

/**
 * Search cache for a matching Q&A by keyword overlap.
 * Returns the best match or null.
 */
export function searchCache(query) {
  if (!query || !query.trim()) return null

  const cache = readCache()
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)

  if (!words.length) return null

  let bestMatch = null
  let bestScore = 0

  for (const item of cache) {
    const target = `${item.question} ${item.answer}`.toLowerCase()
    let score = 0

    for (const word of words) {
      if (target.includes(word)) score++
    }

    const ratio = score / words.length
    if (ratio > bestScore && ratio >= 0.4) {
      bestScore = ratio
      bestMatch = item
    }
  }

  return bestMatch
}

/**
 * Get all cached Q&A history, newest first.
 */
export function getCachedHistory() {
  return readCache()
}

/**
 * Remove cached items older than 30 days.
 */
export function clearOldCache() {
  const cache = readCache()
  const now = Date.now()
  const fresh = cache.filter((item) => now - item.cachedAt < MAX_AGE_MS)
  writeCache(fresh)
  return cache.length - fresh.length
}

/**
 * Get approximate storage usage for the Q&A cache in bytes.
 */
export function getStorageUsage() {
  const raw = localStorage.getItem(CACHE_KEY) || ''
  const bytes = new Blob([raw]).size
  return {
    bytes,
    formatted: bytes < 1024
      ? `${bytes} B`
      : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`,
    itemCount: readCache().length,
  }
}
