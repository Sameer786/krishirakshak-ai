export default function LanguageToggle({ lang, onChange }) {
  const isHindi = lang.startsWith('hi')

  return (
    <div className="flex items-center justify-center gap-1 bg-white rounded-full p-1 shadow-sm border border-gray-200">
      <button
        onClick={() => onChange('hi-IN')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          isHindi
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        हिंदी
      </button>
      <button
        onClick={() => onChange('en-IN')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !isHindi
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        English
      </button>
    </div>
  )
}
