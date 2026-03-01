import { useState, useEffect, useCallback } from 'react'

export default function BottomSheet({ open, onClose, onCamera, onUpload }) {
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 200)
  }, [onClose])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, handleClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className={`bottom-sheet-overlay ${closing ? 'closing' : ''}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={`bottom-sheet-panel ${closing ? 'closing' : ''}`}>
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-800 mb-4 text-center">
          Choose an option
        </p>

        {/* Options */}
        <div className="space-y-3">
          {/* Take Photo */}
          <button
            type="button"
            onClick={() => { handleClose(); setTimeout(onCamera, 220) }}
            className="w-full flex items-center gap-4 px-4 py-4 bg-primary-50 border border-primary-200 rounded-2xl text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">Take Photo</p>
              <p className="text-xs text-gray-500">Use camera to capture area</p>
            </div>
          </button>

          {/* Upload from Gallery */}
          <button
            type="button"
            onClick={() => { handleClose(); setTimeout(onUpload, 220) }}
            className="w-full flex items-center gap-4 px-4 py-4 bg-white border border-gray-200 rounded-2xl text-left active:scale-[0.98] transition-transform hover:border-primary-200"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#d97706" className="w-6 h-6">
                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">Upload from Gallery</p>
              <p className="text-xs text-gray-500">Select an existing photo</p>
            </div>
          </button>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full mt-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  )
}
