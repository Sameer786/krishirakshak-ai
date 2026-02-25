export default function VoiceQA() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary-dark">Voice Q&A</h2>
      <p className="text-sm text-gray-500">आवाज़ से सवाल पूछें</p>
      <div className="bg-white rounded-xl p-8 shadow-sm border border-primary-100 text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-primary-50 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-primary">
            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
          </svg>
        </div>
        <p className="text-gray-600 text-sm">
          Ask safety questions in Hindi or English. AI-powered responses with voice output.
        </p>
        <p className="text-xs text-gray-400">Coming in Phase 2</p>
      </div>
    </div>
  )
}
