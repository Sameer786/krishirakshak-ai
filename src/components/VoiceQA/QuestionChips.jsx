export default function QuestionChips({ questions, onSelect }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quick Questions</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left text-sm px-3 py-2 rounded-full bg-white border border-primary-200 text-primary-dark hover:bg-primary-50 active:scale-95 transition-all shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
