import { useState } from 'react'
import { logFeedback } from '../../utils/analytics'

export default function ResponseCard({ item, onSpeak, isSpeaking, onStop, lang }) {
  const [feedback, setFeedback] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: ignore
    }
  }

  const handleFeedback = (type) => {
    setFeedback(type)
    logFeedback({
      question: item.question,
      helpful: type === 'up',
      language: lang?.startsWith('hi') ? 'hi' : 'en',
    })
  }

  const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden ${
      item.isError ? 'border-l-red-400' : 'border-l-primary'
    }`}>
      {/* Offline / Cache badge */}
      {(item.fromCache || item.isOffline) && (
        <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-[10px] text-gray-500 font-medium">
            {item.fromCache ? 'Cached response' : 'Offline'}
          </span>
        </div>
      )}

      {/* Question */}
      <div className="px-4 pt-3 pb-2 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1">You asked:</p>
        <p className="text-sm font-medium text-gray-800">{item.question}</p>
      </div>

      {/* Answer */}
      <div className="px-4 py-3">
        <p className={`text-sm whitespace-pre-line leading-relaxed ${item.isError ? 'text-red-600' : 'text-gray-700'}`}>
          {item.answer}
        </p>
      </div>

      {/* Sources & Confidence */}
      {item.sources?.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-gray-400">Sources:</span>
          {item.sources.map((s) => (
            <span key={s} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded">
              {s}
            </span>
          ))}
          {typeof item.confidence === 'number' && item.confidence > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              item.confidence >= 0.9
                ? 'bg-primary-50 text-primary-dark'
                : item.confidence >= 0.7
                ? 'bg-amber-50 text-amber-700'
                : 'bg-gray-50 text-gray-500'
            }`}>
              {Math.round(item.confidence * 100)}% confident
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Speak / Stop button */}
          {!item.isError && (
            <button
              onClick={() => (isSpeaking ? onStop() : onSpeak(item.answer))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSpeaking
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-primary-50 text-primary-dark border border-primary-200 hover:bg-primary-100'
              }`}
            >
              {isSpeaking ? (
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
                  Listen
                </>
              )}
            </button>
          )}

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375z" clipRule="evenodd" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Feedback + Timestamp */}
        <div className="flex items-center gap-2">
          {!item.isError && (
            <div className="flex gap-1">
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1.5 rounded-full transition-all ${
                  feedback === 'up' ? 'bg-primary-100 text-primary' : 'text-gray-400 hover:text-primary'
                }`}
                aria-label="Helpful"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75A.75.75 0 0115 3a2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                </svg>
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1.5 rounded-full transition-all ${
                  feedback === 'down' ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
                aria-label="Not helpful"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M15.73 5.25h1.035A7.984 7.984 0 0118 9.375c0 .621-.504 1.125-1.125 1.125H14.25a1.125 1.125 0 01-1.12-1.243l.077-.769a6.985 6.985 0 01.95-2.87l.143-.22A1.125 1.125 0 0115.26 5.1l.47.15zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                  <path d="M16.507 5.25c.725 0 1.281.724 1.035 1.41a7.486 7.486 0 01-3.08 3.702c-.396.243-.64.686-.576 1.144l.413 2.932a1.125 1.125 0 01-1.113 1.287H9.613a4.501 4.501 0 00-1.423.23l-3.114 1.04a4.5 4.5 0 01-1.423.23H2.331" />
                </svg>
              </button>
            </div>
          )}
          <span className="text-[10px] text-gray-400">{timeStr}</span>
        </div>
      </div>
    </div>
  )
}
