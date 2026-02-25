import { useState, useCallback, useEffect, useMemo } from 'react'
import TEMPLATES, { PPE_ICONS } from './templates'
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis'

const STORAGE_KEY = 'krishirakshak_jha_progress'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* quota exceeded — silently ignore */
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function JHAChecklist() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [checked, setChecked] = useState({}) // { [itemId]: true }
  const [showCelebration, setShowCelebration] = useState(false)
  const [lang] = useState('hi') // default Hindi TTS

  const { isSpeaking, speak, stop } = useSpeechSynthesis({ lang: 'hi-IN' })

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadProgress()
    // If there's an in-progress checklist, auto-resume
    if (saved.templateId) {
      const tpl = TEMPLATES.find((t) => t.id === saved.templateId)
      if (tpl && saved.checked) {
        const anyUnchecked = tpl.items.some((item) => !saved.checked[item.id])
        if (anyUnchecked) {
          setSelectedTemplate(tpl)
          setChecked(saved.checked)
        }
      }
    }
  }, [])

  // Persist on every check change
  useEffect(() => {
    if (selectedTemplate) {
      saveProgress({ templateId: selectedTemplate.id, checked })
    }
  }, [checked, selectedTemplate])

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------
  const totalItems = selectedTemplate?.items.length || 0
  const checkedCount = useMemo(
    () => (selectedTemplate ? selectedTemplate.items.filter((i) => checked[i.id]).length : 0),
    [checked, selectedTemplate],
  )
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0
  const allComplete = totalItems > 0 && checkedCount === totalItems

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------
  const selectTemplate = useCallback((tpl) => {
    // Check for existing progress
    const saved = loadProgress()
    if (saved.templateId === tpl.id && saved.checked) {
      setChecked(saved.checked)
    } else {
      setChecked({})
    }
    setSelectedTemplate(tpl)
    setShowCelebration(false)
  }, [])

  const toggleItem = useCallback(
    (itemId) => {
      setChecked((prev) => {
        const next = { ...prev }
        if (next[itemId]) {
          delete next[itemId]
        } else {
          next[itemId] = true
        }

        // Check completion after toggle
        if (selectedTemplate) {
          const newCount = selectedTemplate.items.filter((i) => next[i.id]).length
          if (newCount === selectedTemplate.items.length) {
            setTimeout(() => setShowCelebration(true), 300)
          } else {
            setShowCelebration(false)
          }
        }

        return next
      })
    },
    [selectedTemplate],
  )

  const handleReset = useCallback(() => {
    setChecked({})
    setShowCelebration(false)
    saveProgress({ templateId: selectedTemplate?.id, checked: {} })
  }, [selectedTemplate])

  const handleBack = useCallback(() => {
    stop()
    setSelectedTemplate(null)
    setChecked({})
    setShowCelebration(false)
  }, [stop])

  // TTS — read all steps
  const readAllSteps = useCallback(() => {
    if (!selectedTemplate) return
    const text = selectedTemplate.items
      .map((item, idx) => `${idx + 1}. ${item.hi}`)
      .join('। ')
    speak(text)
  }, [selectedTemplate, speak])

  // TTS — single item
  const readItem = useCallback(
    (item) => {
      speak(item.hi)
    },
    [speak],
  )

  // -----------------------------------------------------------------------
  // Template Selection Screen
  // -----------------------------------------------------------------------
  const renderTemplateSelection = () => (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary-dark">Safety Checklist</h2>
        <p className="text-xs text-gray-500">सुरक्षा जांच सूची — select a checklist to begin</p>
      </div>

      {/* Resume banner */}
      {(() => {
        const saved = loadProgress()
        if (!saved.templateId || !saved.checked) return null
        const tpl = TEMPLATES.find((t) => t.id === saved.templateId)
        if (!tpl) return null
        const doneCount = tpl.items.filter((i) => saved.checked[i.id]).length
        if (doneCount === 0 || doneCount === tpl.items.length) return null
        return (
          <button
            onClick={() => selectTemplate(tpl)}
            className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-left active:scale-[0.98] transition-transform"
          >
            <p className="text-sm font-medium text-amber-800">
              Resume: {tpl.title.en}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {doneCount} of {tpl.items.length} completed
            </p>
          </button>
        )
      })()}

      {/* Template cards */}
      <div className="space-y-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => selectTemplate(tpl)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform hover:border-primary/30"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {tpl.icon === 'pesticide' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                    <path d="M15 7v12.97l-4.21-1.81a1 1 0 00-.79 0L6 19.97V7a2 2 0 012-2h5a2 2 0 012 2zm-6.5 2a.75.75 0 00-.75.75v2a.75.75 0 001.5 0v-2A.75.75 0 008.5 9zm3 0a.75.75 0 00-.75.75v2a.75.75 0 001.5 0v-2A.75.75 0 0011.5 9z" />
                    <path d="M17 5.33V4a2 2 0 00-2-2H8a2 2 0 00-2 2v1.33A3 3 0 004 8v12a2 2 0 002 2h12a2 2 0 002-2V8a3 3 0 00-2-2.67z" fillOpacity="0.1" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625C1.5 18.661 2.34 19.5 3.375 19.5h8.25c1.035 0 1.875-.84 1.875-1.875V15z" />
                    <path d="M8.25 19.5a3.375 3.375 0 01-3.163-2.19 1.5 1.5 0 00-1.087.63V19.5h4.25zM14.25 19.5h7.5V6.375c0-1.036-.84-1.875-1.875-1.875h-5.625v15z" fillOpacity="0.1" />
                  </svg>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base">{tpl.title.en}</h3>
                <p className="text-xs text-primary-dark font-medium mt-0.5">{tpl.title.hi}</p>
                <p className="text-xs text-gray-500 mt-1">{tpl.description.en}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">{tpl.items.length} steps</span>
                  <span className="text-xs text-gray-400">~{tpl.estimatedMinutes} min</span>
                </div>
              </div>

              {/* Chevron */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-gray-400 pt-1">
        Complete safety checklists before starting work — works offline
      </p>
    </div>
  )

  // -----------------------------------------------------------------------
  // Celebration overlay
  // -----------------------------------------------------------------------
  const renderCelebration = () => (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center space-y-3 animate-in">
      {/* Checkmark circle */}
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-green-600">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-green-800">All Steps Complete!</h3>
      <p className="text-sm text-green-700">सभी चरण पूर्ण!</p>
      <p className="text-xs text-green-600">
        You have completed all safety checks for this task.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleReset}
          className="flex-1 py-3 bg-white border border-green-200 text-green-700 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
        >
          Reset Checklist
        </button>
        <button
          onClick={handleBack}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          Back to Templates
        </button>
      </div>
    </div>
  )

  // -----------------------------------------------------------------------
  // Checklist Screen
  // -----------------------------------------------------------------------
  const renderChecklist = () => (
    <div className="space-y-4">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-600">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-primary-dark truncate">
            {selectedTemplate.title.en}
          </h2>
          <p className="text-xs text-gray-500 truncate">{selectedTemplate.title.hi}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">
            {checkedCount} of {totalItems} completed
          </span>
          <span className="font-semibold text-primary">{progressPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* TTS controls */}
      <div className="flex gap-2">
        <button
          onClick={isSpeaking ? stop : readAllSteps}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isSpeaking
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}
        >
          {isSpeaking ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
              Stop Reading
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
              </svg>
              Read All Steps
            </>
          )}
        </button>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {selectedTemplate.items.map((item, idx) => {
          const isChecked = !!checked[item.id]
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
                isChecked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-100'
              }`}
            >
              {/* Checkbox — 48px touch target */}
              <button
                onClick={() => toggleItem(item.id)}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border-2 transition-all duration-200 active:scale-90"
                style={{
                  borderColor: isChecked ? '#16a34a' : '#d1d5db',
                  backgroundColor: isChecked ? '#16a34a' : 'transparent',
                }}
                aria-label={`Step ${idx + 1}: ${item.en}`}
                aria-checked={isChecked}
                role="checkbox"
              >
                {isChecked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-6 h-6">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold text-gray-400">{idx + 1}</span>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p
                  className={`text-sm leading-snug transition-colors ${
                    isChecked ? 'text-green-800 line-through' : 'text-gray-800'
                  }`}
                >
                  {item.en}
                </p>
                <p
                  className={`text-xs mt-0.5 transition-colors ${
                    isChecked ? 'text-green-600/70' : 'text-gray-500'
                  }`}
                >
                  {item.hi}
                </p>

                {/* PPE badges */}
                {item.ppe.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.ppe.map((key) => {
                      const ppe = PPE_ICONS[key]
                      if (!ppe) return null
                      return (
                        <span
                          key={key}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isChecked
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px] font-bold">
                            {ppe.icon}
                          </span>
                          {ppe.label}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* TTS button */}
              <button
                onClick={() => readItem(item)}
                className="w-9 h-9 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform mt-0.5"
                aria-label={`Read step ${idx + 1} aloud`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                  <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75z" />
                  <path d="M15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Celebration */}
      {showCelebration && allComplete && renderCelebration()}

      {/* Reset button (only if some are checked and not all complete) */}
      {checkedCount > 0 && !allComplete && (
        <button
          onClick={handleReset}
          className="w-full py-3 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Reset All
        </button>
      )}
    </div>
  )

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-4 pb-4">
      {selectedTemplate ? renderChecklist() : renderTemplateSelection()}
    </div>
  )
}
