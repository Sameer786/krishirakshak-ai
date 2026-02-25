export default function HazardDetection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary-dark">Hazard Detection</h2>
      <p className="text-sm text-gray-500">खतरा पहचान</p>
      <div className="bg-white rounded-xl p-8 shadow-sm border border-primary-100 text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-amber-500">
            <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
            <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-gray-600 text-sm">
          Upload or capture photos to detect farm hazards using AI vision analysis.
        </p>
        <p className="text-xs text-gray-400">Coming in Phase 3</p>
      </div>
    </div>
  )
}
