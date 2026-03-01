import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis'
import useOnlineStatus from '../../hooks/useOnlineStatus'
import { compressImage } from '../../utils/imageUtils'

const DETECTIONS_KEY = 'krishirakshak_detections'
const MAX_SAVED = 20

// Severity styles
const SEV_CARD = {
  CRITICAL: 'bg-red-50 border-red-500',
  HIGH: 'bg-orange-50 border-orange-500',
  MEDIUM: 'bg-yellow-50 border-yellow-500',
  LOW: 'bg-blue-50 border-blue-500',
}

const SEV_BADGE = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-blue-100 text-blue-700',
}

const SEV_DOT = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
  NONE: 'bg-gray-400',
}

const RISK_BANNER = {
  CRITICAL: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-400 text-yellow-900',
  LOW: 'bg-blue-500 text-white',
  NONE: 'bg-gray-200 text-gray-600',
}

// ---------------------------------------------------------------------------
// Save detection to localStorage
// ---------------------------------------------------------------------------
async function saveDetection(imageData, results) {
  try {
    // Create small thumbnail for storage
    let thumbnail = ''
    try {
      const blob = await fetch(imageData).then((r) => r.blob())
      const compressed = await compressImage(blob, 320, 0.5)
      thumbnail = compressed.base64
    } catch {
      // If compression fails, store without thumbnail
    }

    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      thumbnail,
      hazards: results.hazards,
      overallRisk: results.overallRisk,
      hazardCount: results.hazardCount,
      analyzedAt: results.analyzedAt,
      savedAt: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem(DETECTIONS_KEY) || '[]')
    const updated = [record, ...existing].slice(0, MAX_SAVED)
    localStorage.setItem(DETECTIONS_KEY, JSON.stringify(updated))

    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// HazardResults component
// ---------------------------------------------------------------------------
export default function HazardResults({ results, imageData, onNewScan }) {
  const [expanded, setExpanded] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const navigate = useNavigate()
  const { isOnline } = useOnlineStatus()
  const tts = useSpeechSynthesis({ lang: 'en-IN' })

  // Auto-save results to localStorage on mount
  useEffect(() => {
    if (results && imageData && !saved) {
      saveDetection(imageData, results).then((ok) => {
        if (ok) setSaved(true)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle expand a hazard card
  const toggleExpand = useCallback((index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }))
  }, [])

  // Read single hazard aloud
  const speakHazard = useCallback((hazard) => {
    const text = `${hazard.severity} hazard. ${hazard.description}. Recommendation: ${hazard.recommendation}`
    tts.speak(text)
  }, [tts])

  // Read ALL hazards aloud
  const readAllAloud = useCallback(() => {
    if (!results.hazards.length) return

    const lines = [`Overall risk level: ${results.overallRisk}. ${results.hazardCount} hazards detected.`]
    results.hazards.forEach((h, i) => {
      lines.push(`Hazard ${i + 1}: ${h.severity}. ${h.description}. Recommendation: ${h.recommendation}`)
    })

    tts.speak(lines.join(' '))
  }, [results, tts])

  // Save detection
  const handleSave = useCallback(async () => {
    setSaving(true)
    const ok = await saveDetection(imageData, results)
    setSaving(false)
    setSaved(ok)
  }, [imageData, results])

  // Navigate to checklist with hazard context
  const goToChecklist = useCallback(() => {
    navigate('/jha-checklist')
  }, [navigate])

  if (!results) return null

  const hasHazards = results.hazards.length > 0

  // -----------------------------------------------------------
  // Empty state — no hazards
  // -----------------------------------------------------------
  if (!hasHazards) {
    return (
      <div className="space-y-4">
        {/* Image */}
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
          <img src={imageData} alt="Analyzed" className="w-full object-contain max-h-64" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              SAFE
            </span>
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-3">
            <p className="text-white text-[10px]">Analysis complete</p>
          </div>
        </div>

        {/* Safe message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2">
          <div className="w-14 h-14 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-base font-semibold text-green-800">No hazards detected!</p>
          <p className="text-sm text-green-600">कोई खतरा नहीं मिला!</p>
          <p className="text-xs text-gray-500 pt-1">
            Tip: Try photographing equipment, chemicals, or work areas for a thorough safety check.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onNewScan}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold shadow-md active:scale-[0.98] transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
            </svg>
            Analyze Another
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400">
          Analyzed at {new Date(results.analyzedAt).toLocaleTimeString()}
        </p>
      </div>
    )
  }

  // -----------------------------------------------------------
  // Hazards found
  // -----------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Image with overlay */}
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
        <img src={imageData} alt="Analyzed" className="w-full object-contain max-h-56" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <p className="text-white text-[10px]">Analysis complete</p>
        </div>
      </div>

      {/* Overall risk banner */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${RISK_BANNER[results.overallRisk] || RISK_BANNER.NONE}`}>
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full ${SEV_DOT[results.overallRisk] || SEV_DOT.NONE} ring-2 ring-white/40`} />
          <div>
            <p className="text-lg font-bold">{results.overallRisk} RISK</p>
            <p className="text-xs opacity-80">{results.hazardCount} hazard{results.hazardCount !== 1 ? 's' : ''} detected</p>
          </div>
        </div>
        {/* Read All Aloud */}
        <button
          onClick={tts.isSpeaking ? tts.stop : readAllAloud}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
        >
          {tts.isSpeaking ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
              Read All
            </>
          )}
        </button>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-[10px] text-gray-500 font-medium">
            Offline — results based on demo data
          </span>
        </div>
      )}

      {/* Hazard cards */}
      <div className="space-y-3">
        {results.hazards.map((hazard, i) => {
          const isOpen = expanded[i]

          return (
            <div
              key={i}
              className={`rounded-xl border-l-4 overflow-hidden bg-white shadow-sm ${SEV_CARD[hazard.severity] || SEV_CARD.LOW}`}
            >
              {/* Header — always visible, tap to expand */}
              <button
                onClick={() => toggleExpand(i)}
                className="w-full text-left px-4 py-3 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${SEV_BADGE[hazard.severity] || SEV_BADGE.LOW}`}>
                      {hazard.severity}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {Math.round(hazard.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{hazard.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{hazard.hindiDescription}</p>
                </div>

                {/* Chevron */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Expandable recommendation */}
              {isOpen && (
                <div className="px-4 pb-3 space-y-2 border-t border-gray-100">
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 font-medium mb-1">Recommendation:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{hazard.recommendation}</p>
                    <p className="text-xs text-gray-400 mt-1">{hazard.hindiRecommendation}</p>
                  </div>

                  {/* Speak this hazard */}
                  <button
                    onClick={(e) => { e.stopPropagation(); speakHazard(hazard) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M10.5 3.75a.75.75 0 00-1.264-.546L5.203 7H2.667a.75.75 0 00-.7.48A6.985 6.985 0 001.5 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796A.75.75 0 0010.5 16.25V3.75zM14.329 5.984a.75.75 0 00-.658 1.35 5.5 5.5 0 010 5.314.75.75 0 00.658 1.35 7 7 0 000-8.014z" />
                    </svg>
                    Read aloud
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons — 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Analyze Another */}
        <button
          onClick={onNewScan}
          className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
            <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
            </svg>
          Analyze Another
        </button>

        {/* Save Detection */}
        <button
          onClick={handleSave}
          disabled={saved || saving}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium active:scale-[0.98] transition-all ${
            saved
              ? 'bg-green-50 text-green-700 border-2 border-green-200'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
          }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : saved ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V8.846c0-.497-.197-.974-.549-1.326l-4.97-4.97A1.875 1.875 0 0013.404 2h-3.279A1.875 1.875 0 008.25 3.375v2.25a.375.375 0 01-.375.375H6.375A.375.375 0 016 5.625v-2.25c0-.621.504-1.125 1.125-1.125h1.5a.375.375 0 01.375.375v.75a.375.375 0 01-.375.375h-.75a.375.375 0 00-.375.375V5.25c0 .207.168.375.375.375h.75a.375.375 0 00.375-.375v-.75a.375.375 0 01.375-.375h3.654c.166 0 .326.066.443.183l4.971 4.971a.625.625 0 01.183.443v11.528a.375.375 0 01-.375.375H6a.375.375 0 01-.375-.375V3.375z" />
            </svg>
          )}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Detection'}
        </button>

        {/* Read All Aloud */}
        <button
          onClick={tts.isSpeaking ? tts.stop : readAllAloud}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium active:scale-[0.98] transition-all ${
            tts.isSpeaking
              ? 'bg-red-50 text-red-600 border-2 border-red-200'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
          }`}
        >
          {tts.isSpeaking ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              </svg>
              Read Aloud
            </>
          )}
        </button>

        {/* Get Safety Checklist */}
        <button
          onClick={goToChecklist}
          className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z" clipRule="evenodd" />
          </svg>
          Safety Checklist
        </button>
      </div>

      {/* Timestamp */}
      <p className="text-center text-[10px] text-gray-400">
        Analyzed at {new Date(results.analyzedAt).toLocaleTimeString()}
      </p>
    </div>
  )
}
