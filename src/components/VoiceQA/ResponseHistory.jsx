import ResponseCard from './ResponseCard'

export default function ResponseHistory({ history, onSpeak, speakingIndex, onStop }) {
  if (!history.length) return null

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Recent Questions</p>
      {history.map((item, i) => (
        <ResponseCard
          key={item.timestamp}
          item={item}
          onSpeak={onSpeak}
          isSpeaking={speakingIndex === i}
          onStop={onStop}
        />
      ))}
    </div>
  )
}
