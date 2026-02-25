// ---------------------------------------------------------------------------
// KrishiRakshak — Unified localStorage Service
// ---------------------------------------------------------------------------
// Key convention:  kr_<domain>  or  kr_<domain>_<id>
// ---------------------------------------------------------------------------

const KEYS = {
  CHECKLIST: (id) => `kr_checklist_${id}`,
  CHECKLIST_INDEX: 'kr_checklist_index', // list of {templateId, completedAt}
  QA_HISTORY: 'kr_qa_history',
  HAZARD_HISTORY: 'kr_hazard_history',
  SETTINGS: 'kr_settings',
  LANGUAGE: 'kr_language',
  SYNC_TS: 'kr_sync_timestamp',
}

const LIMITS = {
  QA_MAX: 50,
  HAZARD_MAX: 30,
  TARGET_BYTES: 5 * 1024 * 1024, // 5 MB
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

export function isStorageAvailable() {
  try {
    const key = '__kr_test__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      autoCleanup()
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch {
        console.warn('[storageService] Storage quota exceeded even after cleanup')
        return false
      }
    }
    console.warn('[storageService] Failed to write:', key, err)
    return false
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function autoCleanup() {
  // Remove oldest Q&A items beyond half the limit
  const qa = safeGet(KEYS.QA_HISTORY, [])
  if (qa.length > LIMITS.QA_MAX / 2) {
    safeSet(KEYS.QA_HISTORY, qa.slice(0, Math.floor(LIMITS.QA_MAX / 2)))
  }
  // Remove oldest hazard detections beyond half the limit
  const haz = safeGet(KEYS.HAZARD_HISTORY, [])
  if (haz.length > LIMITS.HAZARD_MAX / 2) {
    safeSet(KEYS.HAZARD_HISTORY, haz.slice(0, Math.floor(LIMITS.HAZARD_MAX / 2)))
  }
}

// ---------------------------------------------------------------------------
// Debounced checklist save (500ms)
// ---------------------------------------------------------------------------
let _checklistTimer = null

function debouncedChecklistSave(templateId, data) {
  clearTimeout(_checklistTimer)
  _checklistTimer = setTimeout(() => {
    safeSet(KEYS.CHECKLIST(templateId), data)
  }, 500)
}

// ---------------------------------------------------------------------------
// CHECKLIST STORAGE
// ---------------------------------------------------------------------------

export function saveChecklistProgress(templateId, items) {
  if (!templateId) return false
  const data = {
    templateId,
    items, // { [itemId]: true }
    updatedAt: Date.now(),
  }
  debouncedChecklistSave(templateId, data)
  return true
}

export function getChecklistProgress(templateId) {
  if (!templateId) return null
  return safeGet(KEYS.CHECKLIST(templateId), null)
}

export function markChecklistComplete(templateId) {
  const index = safeGet(KEYS.CHECKLIST_INDEX, [])
  // Avoid duplicates
  const filtered = index.filter((e) => e.templateId !== templateId)
  filtered.unshift({ templateId, completedAt: Date.now() })
  safeSet(KEYS.CHECKLIST_INDEX, filtered)
}

export function getCompletedChecklists() {
  return safeGet(KEYS.CHECKLIST_INDEX, [])
}

export function deleteChecklist(templateId) {
  safeRemove(KEYS.CHECKLIST(templateId))
  const index = safeGet(KEYS.CHECKLIST_INDEX, [])
  safeSet(
    KEYS.CHECKLIST_INDEX,
    index.filter((e) => e.templateId !== templateId),
  )
}

// ---------------------------------------------------------------------------
// Q&A CACHE
// ---------------------------------------------------------------------------

export function saveQA(question, answer, language, sources = [], confidence = 0) {
  if (!question || !answer) return false

  const history = safeGet(KEYS.QA_HISTORY, [])

  // Deduplicate — remove existing with same question
  const filtered = history.filter(
    (item) => item.question.toLowerCase() !== question.toLowerCase(),
  )

  filtered.unshift({
    question,
    answer,
    language,
    sources,
    confidence,
    savedAt: Date.now(),
  })

  // Enforce FIFO limit
  return safeSet(KEYS.QA_HISTORY, filtered.slice(0, LIMITS.QA_MAX))
}

export function searchQACache(query) {
  if (!query?.trim()) return null

  const history = safeGet(KEYS.QA_HISTORY, [])
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)

  if (!words.length) return null

  let bestMatch = null
  let bestScore = 0

  for (const item of history) {
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

export function getQAHistory(limit = 50) {
  const history = safeGet(KEYS.QA_HISTORY, [])
  return history.slice(0, limit)
}

// ---------------------------------------------------------------------------
// HAZARD DETECTION HISTORY
// ---------------------------------------------------------------------------

export function saveHazardDetection(detection) {
  if (!detection) return false

  const history = safeGet(KEYS.HAZARD_HISTORY, [])

  history.unshift({
    ...detection,
    savedAt: Date.now(),
  })

  // Enforce FIFO limit
  return safeSet(KEYS.HAZARD_HISTORY, history.slice(0, LIMITS.HAZARD_MAX))
}

export function getHazardHistory(limit = 30) {
  const history = safeGet(KEYS.HAZARD_HISTORY, [])
  return history.slice(0, limit)
}

// ---------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------

export function getLanguage() {
  return safeGet(KEYS.LANGUAGE, 'hi')
}

export function setLanguage(lang) {
  return safeSet(KEYS.LANGUAGE, lang)
}

export function getSyncTimestamp() {
  return safeGet(KEYS.SYNC_TS, null)
}

export function setSyncTimestamp(ts = Date.now()) {
  return safeSet(KEYS.SYNC_TS, ts)
}

// ---------------------------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------------------------

export function getStorageStats() {
  const keys = []
  const counts = { checklist: 0, qa: 0, hazard: 0, other: 0 }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('kr_')) {
        keys.push(key)
        if (key.startsWith('kr_checklist')) counts.checklist++
        else if (key === KEYS.QA_HISTORY) counts.qa = safeGet(KEYS.QA_HISTORY, []).length
        else if (key === KEYS.HAZARD_HISTORY) counts.hazard = safeGet(KEYS.HAZARD_HISTORY, []).length
        else counts.other++
      }
    }
  } catch {
    /* ignore */
  }

  let totalBytes = 0
  for (const key of keys) {
    try {
      const val = localStorage.getItem(key) || ''
      totalBytes += key.length * 2 + val.length * 2 // UTF-16
    } catch {
      /* ignore */
    }
  }

  const mb = totalBytes / (1024 * 1024)

  return {
    totalBytes,
    totalMB: parseFloat(mb.toFixed(3)),
    formatted: mb < 1 ? `${(totalBytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`,
    itemCounts: counts,
    keyCount: keys.length,
  }
}

export function clearAllData() {
  try {
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('kr_')) toRemove.push(key)
    }
    toRemove.forEach((key) => localStorage.removeItem(key))

    // Also clean legacy keys from older code
    localStorage.removeItem('krishirakshak_qa_cache')
    localStorage.removeItem('krishirakshak_detections')
    localStorage.removeItem('krishirakshak_jha_progress')

    return toRemove.length
  } catch {
    return 0
  }
}

export function exportAllData() {
  const data = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('kr_')) {
        data[key] = safeGet(key, null)
      }
    }
  } catch {
    /* ignore */
  }
  return data
}
