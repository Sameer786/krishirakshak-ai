import { useState, useRef, useCallback, useEffect } from 'react'
import { compressImage, validateImageFile, canvasToBase64 } from '../../utils/imageUtils'

// UI states
const STATE = {
  INITIAL: 'initial',
  CAMERA_ACTIVE: 'camera_active',
  IMAGE_CAPTURED: 'captured',
  ANALYZING: 'analyzing',
  RESULTS: 'results',
}

export default function HazardDetection() {
  const [uiState, setUiState] = useState(STATE.INITIAL)
  const [imageData, setImageData] = useState(null) // base64
  const [error, setError] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [results, setResults] = useState(null)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // -----------------------------------------------------------
  // Camera
  // -----------------------------------------------------------
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    setCameraError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setUiState(STATE.CAMERA_ACTIVE)
    } catch (err) {
      let msg = 'Camera not available. Please upload an image instead.'
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings, or upload an image.'
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera found on this device. Please upload an image instead.'
      }
      setCameraError(msg)
    }
  }, [])

  // Clean up camera on unmount
  useEffect(() => stopCamera, [stopCamera])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const base64 = canvasToBase64(canvas, 0.85)
    setImageData(base64)
    stopCamera()
    setUiState(STATE.IMAGE_CAPTURED)
  }, [stopCamera])

  // -----------------------------------------------------------
  // File upload
  // -----------------------------------------------------------
  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so the same file can be re-selected
    e.target.value = ''

    setError(null)
    const validation = validateImageFile(file, 5)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    try {
      const compressed = await compressImage(file, 1920, 0.8)
      setImageData(compressed.base64)
      stopCamera()
      setUiState(STATE.IMAGE_CAPTURED)
    } catch {
      setError('Failed to process image. Please try a different file.')
    }
  }, [stopCamera])

  // -----------------------------------------------------------
  // Analyze (placeholder — will wire to API in next prompt)
  // -----------------------------------------------------------
  const handleAnalyze = useCallback(async () => {
    if (!imageData) return
    setUiState(STATE.ANALYZING)
    setError(null)

    // TODO: Replace with actual API call in Prompt 3.2
    // Simulate analysis delay for now
    await new Promise((r) => setTimeout(r, 2000))

    setResults({
      hazards: [
        {
          type: 'equipment_general',
          severity: 'LOW',
          confidence: 0.82,
          description: 'Agricultural equipment — check maintenance schedule',
          recommendation: 'Inspect before use. Store properly after use.',
          hindiDescription: 'सामान्य कृषि उपकरण — रखरखाव जांचें',
          hindiRecommendation: 'उपयोग से पहले जांचें। उपयोग के बाद ठीक से रखें।',
        },
      ],
      overallRisk: 'LOW',
      hazardCount: 1,
      detectedLabels: [],
      analyzedAt: new Date().toISOString(),
    })
    setUiState(STATE.RESULTS)
  }, [imageData])

  // -----------------------------------------------------------
  // Reset
  // -----------------------------------------------------------
  const handleRetake = useCallback(() => {
    setImageData(null)
    setResults(null)
    setError(null)
    setUiState(STATE.INITIAL)
  }, [])

  // -----------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------

  // INITIAL state — two action buttons
  const renderInitial = () => (
    <div className="space-y-4">
      {/* Take Photo */}
      <button
        onClick={startCamera}
        className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl text-lg font-semibold shadow-lg active:scale-[0.98] transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
          <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
        </svg>
        Take Photo
      </button>

      {/* Upload */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl text-base font-medium hover:border-primary hover:text-primary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M1.5 14.25a.75.75 0 01.75-.75h19.5a.75.75 0 010 1.5H2.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
        Upload from Gallery
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hint */}
      <p className="text-center text-xs text-gray-400 pt-1">
        Take a photo of farm equipment, chemicals, or work areas to detect hazards
      </p>
    </div>
  )

  // CAMERA state — live preview + capture button
  const renderCamera = () => (
    <div className="space-y-3">
      {/* Video preview */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Close camera */}
        <button
          onClick={() => { stopCamera(); setUiState(STATE.INITIAL) }}
          className="absolute top-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Capture button */}
      <div className="flex justify-center">
        <button
          onClick={capturePhoto}
          className="w-20 h-20 rounded-full border-[5px] border-primary bg-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Capture photo"
        >
          <div className="w-14 h-14 rounded-full bg-primary" />
        </button>
      </div>

      {/* Or upload */}
      <button
        onClick={() => { stopCamera(); fileInputRef.current?.click() }}
        className="w-full text-center py-2 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        Or upload from gallery
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )

  // IMAGE_CAPTURED state — preview + analyze/retake
  const renderCaptured = () => (
    <div className="space-y-4">
      {/* Image preview */}
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={imageData}
          alt="Captured"
          className="w-full object-contain max-h-80"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleRetake}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium active:scale-[0.98] transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.28a.75.75 0 00-.75.75v3.955a.75.75 0 001.5 0v-2.134l.246.245a7 7 0 0011.712-3.138.75.75 0 00-1.676-.333zm1.176-7.088a.75.75 0 00-1.5 0v2.134l-.246-.245A7 7 0 003.03 9.363a.75.75 0 101.676.333 5.5 5.5 0 019.201-2.466l.312.311h-2.433a.75.75 0 000 1.5H15.738a.75.75 0 00.75-.75V4.336z" clipRule="evenodd" />
          </svg>
          Retake
        </button>
        <button
          onClick={handleAnalyze}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold shadow-md active:scale-[0.98] transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h9V4.606c0-.771-.59-1.43-1.375-1.489A41.568 41.568 0 006.5 3zM2 12v5.5A1.5 1.5 0 003.5 19h3A1.5 1.5 0 008 17.5V12H2zm11.5-9c-1.051 0-2.093.04-3.125.117-.03.002-.06.005-.09.008V10.5H22V4.607c0-.771-.59-1.43-1.375-1.489A41.568 41.568 0 0017.5 3zM22 12h-9.5v5.5a1.5 1.5 0 001.5 1.5h3a1.5 1.5 0 001.5-1.5V12z" />
          </svg>
          Analyze Hazards
        </button>
      </div>
    </div>
  )

  // ANALYZING state — loading animation
  const renderAnalyzing = () => (
    <div className="space-y-4">
      {/* Dimmed image */}
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={imageData}
          alt="Analyzing"
          className="w-full object-contain max-h-80 opacity-50"
        />
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center space-y-3">
            {/* Spinner */}
            <div className="w-12 h-12 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700">AI analyzing image...</p>
            <p className="text-xs text-gray-400">Detecting hazards and safety risks</p>
          </div>
        </div>
      </div>
    </div>
  )

  // RESULTS state — hazard list
  const renderResults = () => {
    if (!results) return null

    const sevColor = {
      CRITICAL: 'bg-red-100 text-red-700 border-red-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
      LOW: 'bg-green-100 text-green-700 border-green-200',
      NONE: 'bg-gray-100 text-gray-600 border-gray-200',
    }

    const riskColor = {
      CRITICAL: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-amber-500',
      LOW: 'bg-green-500',
      NONE: 'bg-gray-400',
    }

    return (
      <div className="space-y-4">
        {/* Image with risk badge */}
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
          <img
            src={imageData}
            alt="Analyzed"
            className="w-full object-contain max-h-64"
          />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${sevColor[results.overallRisk] || sevColor.NONE}`}>
              <span className={`w-2 h-2 rounded-full ${riskColor[results.overallRisk] || riskColor.NONE}`} />
              {results.overallRisk} RISK
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">Detected Hazards</h3>
            <span className="text-xs text-gray-400">
              {results.hazardCount} found
            </span>
          </div>

          {results.hazards.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-green-600 font-medium">No hazards detected</p>
              <p className="text-xs text-gray-400 mt-1">The image appears safe</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.hazards.map((hazard, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${sevColor[hazard.severity] || sevColor.LOW}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sevColor[hazard.severity]}`}>
                          {hazard.severity}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {Math.round(hazard.confidence * 100)}% confident
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{hazard.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{hazard.hindiDescription}</p>
                      <div className="mt-2 pt-2 border-t border-gray-200/50">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Action:</span> {hazard.recommendation}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{hazard.hindiRecommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRetake}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium active:scale-[0.98] transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
            </svg>
            New Scan
          </button>
          <button
            onClick={() => {/* TODO: Wire to Voice QA for advice */}}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold shadow-md active:scale-[0.98] transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 3.975 1 5.389v5.222c0 1.414.993 2.634 2.43 2.865.932.15 1.873.264 2.82.336.375.03.673.31.748.682l.6 2.98a.75.75 0 001.17.351l3.028-2.42c.264-.212.603-.327.95-.354a39.78 39.78 0 002.684-.243c1.437-.231 2.43-1.451 2.43-2.865V5.389c0-1.414-.993-2.634-2.43-2.865A41.289 41.289 0 0010 2z" clipRule="evenodd" />
            </svg>
            Get Advice
          </button>
        </div>

        {/* Timestamp */}
        <p className="text-center text-[10px] text-gray-400">
          Analyzed at {new Date(results.analyzedAt).toLocaleTimeString()}
        </p>
      </div>
    )
  }

  // -----------------------------------------------------------
  // Main render
  // -----------------------------------------------------------
  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary-dark">Hazard Detection</h2>
        <p className="text-xs text-gray-500">खतरा पहचान — AI-powered safety scan</p>
      </div>

      {/* Camera permission error banner */}
      {cameraError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          <p className="font-medium mb-1">Camera unavailable</p>
          <p className="text-xs">{cameraError}</p>
        </div>
      )}

      {/* General error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* State-based UI */}
      {uiState === STATE.INITIAL && renderInitial()}
      {uiState === STATE.CAMERA_ACTIVE && renderCamera()}
      {uiState === STATE.IMAGE_CAPTURED && renderCaptured()}
      {uiState === STATE.ANALYZING && renderAnalyzing()}
      {uiState === STATE.RESULTS && renderResults()}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input (also needed in camera state) */}
      {uiState !== STATE.INITIAL && uiState !== STATE.CAMERA_ACTIVE && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}
    </div>
  )
}
