import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { logFeedback } from '../../utils/analytics'

export default function ChatBubble({ item, onSpeak, isSpeaking, onStop, lang }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const timeAgo = () => {
    const diff = Date.now() - item.timestamp
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const sourceLine = item.sources?.length > 0
    ? item.sources.map(s => s).join(' • ')
    : null

  const confidencePercent = typeof item.confidence === 'number' && item.confidence > 0
    ? `${Math.round(item.confidence * 100)}%`
    : null

  return (
    <div className="space-y-1 px-4">
      {/* User question — right-aligned green bubble */}
      <div className="flex justify-end">
        <div className="chat-bubble-user">
          <p className="text-sm whitespace-pre-line">{item.question}</p>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-right pr-1">{timeAgo()}</p>

      {/* AI response — left-aligned white bubble */}
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none mt-1 shrink-0">🌾</span>
        <div className="min-w-0 max-w-[85%]">
          <div className={`chat-bubble-ai ${item.isError ? 'border-red-200' : ''}`}>
            {/* Answer */}
            <div className={`text-sm leading-relaxed ${item.isError ? 'text-red-600' : 'text-gray-700'}`}>
              {item.isError ? (
                <p className="whitespace-pre-line">{item.answer}</p>
              ) : (
                <div className="markdown-response">
                  <ReactMarkdown>{item.answer}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Footer: sources + actions */}
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
              {/* Sources + confidence */}
              <div className="text-[10px] text-gray-400 truncate mr-2">
                {sourceLine && <span>📚 {sourceLine}</span>}
                {sourceLine && confidencePercent && <span> • </span>}
                {confidencePercent && <span>{confidencePercent}</span>}
              </div>

              {/* Action icons */}
              {!item.isError && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => (isSpeaking ? onStop() : onSpeak(item.answer))}
                    className={`p-1.5 rounded-full transition-all ${
                      isSpeaking ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-primary hover:bg-primary-50'
                    }`}
                    title={isSpeaking ? 'Stop' : 'Listen'}
                  >
                    {isSpeaking ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm5-2.25A.75.75 0 017.75 7h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5zm4 0a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                        <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`p-1.5 rounded-full transition-all ${
                      copied ? 'text-primary bg-primary-50' : 'text-gray-400 hover:text-primary hover:bg-primary-50'
                    }`}
                    title={copied ? 'Copied!' : 'Copy'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5v-3.25a3.25 3.25 0 00-3.25-3.25H7V5.25A2.25 2.25 0 019.25 3h4.488c.596 0 1.168.236 1.59.66l.66.352z" clipRule="evenodd" />
                      <path d="M3 9.25A2.25 2.25 0 015.25 7h4.5A2.25 2.25 0 0112 9.25v5.5A2.25 2.25 0 019.75 17h-4.5A2.25 2.25 0 013 14.75v-5.5z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 pl-1">{timeAgo()}</p>
        </div>
      </div>
    </div>
  )
}
