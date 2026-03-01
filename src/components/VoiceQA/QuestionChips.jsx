export default function QuestionChips({ questions, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {questions.map((q) => (
        <button
          type="button"
          key={q}
          onClick={() => onSelect(q)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-primary-200 text-primary-dark hover:bg-primary-50 active:scale-95 transition-all whitespace-nowrap"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
