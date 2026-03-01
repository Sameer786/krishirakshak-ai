import { useState, useRef, useCallback, useEffect } from 'react'
import { compressImage, validateImageFile, canvasToBase64 } from '../../utils/imageUtils'
import { analyzeHazards } from '../../services/aws/rekognitionService'
import HazardResults from './HazardResults'
import BottomSheet from './BottomSheet'

const DETECTIONS_KEY = 'krishirakshak_detections'

// UI states
const STATE = {
  INITIAL: 'initial',
  CAMERA_ACTIVE: 'camera_active',
  IMAGE_CAPTURED: 'captured',
  ANALYZING: 'analyzing',
  RESULTS: 'results',
}

// Load recent scans from localStorage
function loadRecentScans() {
  try {
    const data = JSON.parse(localStorage.getItem(DETECTIONS_KEY) || '[]')
    return data.slice(0, 3)
  } catch {
    return []
  }
}

export default function HazardDetection() {
  const [uiState, setUiState] = useState(STATE.INITIAL)
  const [imageData, setImageData] = useState(null) // base64
  const [error, setError] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [results, setResults] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [recentScans, setRecentScans] = useState(loadRecentScans)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const isMountedRef = useRef(true)
  const analyzeRef = useRef(null)

  // Refresh recent scans when returning to initial state
  useEffect(() => {
    if (uiState === STATE.INITIAL) {
      setRecentScans(loadRecentScans())
    }
  }, [uiState])

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

  const startCamera = useCallback(async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setError(null)
    setCameraError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      const videoTracks = stream.getVideoTracks()
      if (videoTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop())
        setCameraError('Camera unavailable. Please use Upload from Gallery.')
        return
      }

      streamRef.current = stream
      setUiState(STATE.CAMERA_ACTIVE)
    } catch (err) {
      if (!isMountedRef.current) return
      let msg = 'Camera not available. Please upload an image instead.'
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings, or upload an image.'
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera found on this device. Please upload an image instead.'
      }
      setCameraError(msg)
    }
  }, [])

  // Attach stream to <video> element
  useEffect(() => {
    if (uiState !== STATE.CAMERA_ACTIVE) return
    if (!streamRef.current || !videoRef.current) return

    const video = videoRef.current
    video.srcObject = streamRef.current
    video.setAttribute('autoplay', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('muted', '')
    video.muted = true

    video.play().catch(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      setCameraError('Camera could not start. Please use Upload from Gallery.')
      setUiState(STATE.INITIAL)
    })
  }, [uiState])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  const capturePhoto = useCallback((e) => {
    if (e) { e.preventDefault(); e.stopPropagation() }
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
    e.target.value = ''

    setError(null)
    const validation = validateImageFile(file, 5)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    try {
      const compressed = await compressImage(file, 1920, 0.8)
      if (!isMountedRef.current) return
      setImageData(compressed.base64)
      stopCamera()
      setUiState(STATE.IMAGE_CAPTURED)
    } catch {
      if (!isMountedRef.current) return
      setError('Failed to process image. Please try a different file.')
    }
  }, [stopCamera])

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // -----------------------------------------------------------
  // Analyze
  // -----------------------------------------------------------
  const handleAnalyze = useCallback(async () => {
    if (!imageData) return
    setUiState(STATE.ANALYZING)
    setError(null)

    try {
      const data = await analyzeHazards(imageData)
      if (!isMountedRef.current) return

      if (data.error) {
        setError(data.errorMessage || 'Analysis failed. Please try again.')
        setUiState(STATE.IMAGE_CAPTURED)
        return
      }

      setResults(data)
      setUiState(STATE.RESULTS)
    } catch {
      if (!isMountedRef.current) return
      setError('Something went wrong during analysis. Please try again.')
      setUiState(STATE.IMAGE_CAPTURED)
    }
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
  // Render: INITIAL state
  // -----------------------------------------------------------
  const renderInitial = () => (
    <div className="space-y-5">
      {/* Camera Viewfinder Placeholder */}
      <div className="viewfinder-frame rounded-2xl bg-primary-50 border-2 border-dashed border-primary-200 p-6 flex flex-col items-center justify-center" style={{ minHeight: '200px' }}>
        <span className="viewfinder-corner-bl" />
        <span className="viewfinder-corner-br" />
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
            <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
            <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm font-medium text-primary-700 text-center">
          Position your camera at the area
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Equipment, chemicals, or work areas
        </p>
      </div>

      {/* Start Scan Button */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl text-lg font-semibold shadow-lg active:scale-[0.98] transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
          <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
          </svg>
        Start Scan
      </button>

      {/* Hazard Info Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Levels</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1.5 p-3 bg-red-50 border border-red-100 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-red-700">CRITICAL</span>
            <span className="text-[9px] text-red-500 text-center leading-tight">Immediate danger</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold text-amber-700">HIGH</span>
            <span className="text-[9px] text-amber-500 text-center leading-tight">Serious risk</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-[10px] font-bold text-yellow-700">MEDIUM</span>
            <span className="text-[9px] text-yellow-500 text-center leading-tight">Caution needed</span>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Scans</h3>
          <div className="space-y-2">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
              >
                {/* Thumbnail */}
                {scan.thumbnail ? (
                  <img
                    src={scan.thumbnail}
                    alt="Scan"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      scan.overallRisk === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      scan.overallRisk === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      scan.overallRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      scan.overallRisk === 'LOW' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {scan.overallRisk || 'SAFE'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {scan.hazardCount || 0} hazard{scan.hazardCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatScanDate(scan.savedAt || scan.analyzedAt)}
                  </p>
                </div>

                {/* Arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 flex-shrink-0">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-2">
        <div className="flex items-center gap-1.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-medium">Secure</span>
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M4.632 3.533A2 2 0 016.577 2h6.846a2 2 0 011.945 1.533l1.976 8.234A3.489 3.489 0 0016 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234z" />
            <path fillRule="evenodd" d="M4 13a2 2 0 100 4h12a2 2 0 100-4H4zm11.24 2a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V15zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75h-.01z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-medium">AWS Powered</span>
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-medium">AI-Verified</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )

  // -----------------------------------------------------------
  // Render: CAMERA state
  // -----------------------------------------------------------
  const renderCamera = () => (
    <div className="space-y-3">
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', backgroundColor: '#000' }}
        />

        {/* Scan line */}
        <div className="absolute left-4 right-4 h-0.5 bg-primary/60 scan-line-anim" />

        {/* Close camera */}
        <button
          type="button"
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
          type="button"
          onClick={capturePhoto}
          className="w-20 h-20 rounded-full border-[5px] border-primary bg-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Capture photo"
        >
          <div className="w-14 h-14 rounded-full bg-primary" />
        </button>
      </div>

      <button
        type="button"
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

  // -----------------------------------------------------------
  // Render: IMAGE_CAPTURED state
  // -----------------------------------------------------------
  const renderCaptured = () => (
    <div className="space-y-4" style={{ paddingBottom: '100px' }}>
      {/* Image preview */}
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden" style={{ maxHeight: '250px' }}>
        <img
          src={imageData}
          alt="Captured"
          className="w-full object-contain"
          style={{ maxHeight: '250px' }}
          onLoad={() => {
            setTimeout(() => {
              analyzeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }, 100)
          }}
        />
      </div>

      {/* Analyze Hazards — large green CTA */}
      <button
        ref={analyzeRef}
        type="button"
        onClick={handleAnalyze}
        className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl text-lg font-semibold shadow-lg active:scale-[0.98] transition-transform"
      >
        <span className="text-xl">🔍</span>
        Analyze Hazards
      </button>

      {/* Retake — outlined secondary */}
      <button
        type="button"
        onClick={handleRetake}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-medium active:scale-[0.98] transition-transform hover:border-primary hover:text-primary"
      >
        <span>↩️</span>
        Retake
      </button>
    </div>
  )

  // -----------------------------------------------------------
  // Render: ANALYZING state
  // -----------------------------------------------------------
  const renderAnalyzing = () => (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={imageData}
          alt="Analyzing"
          className="w-full object-contain max-h-64 opacity-50"
        />
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center space-y-3">
            <div className="w-12 h-12 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700">AI analyzing image...</p>
            <p className="text-xs text-gray-400">Detecting hazards and safety risks</p>
          </div>
        </div>
      </div>
    </div>
  )

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

      {/* Camera permission error */}
      {cameraError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          <p className="font-medium mb-1">Camera unavailable</p>
          <p className="text-xs">{cameraError}</p>
        </div>
      )}

      {/* General error */}
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
      {uiState === STATE.RESULTS && (
        <HazardResults results={results} imageData={imageData} onNewScan={handleRetake} />
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input fallback */}
      {uiState !== STATE.INITIAL && uiState !== STATE.CAMERA_ACTIVE && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={startCamera}
        onUpload={triggerFileUpload}
      />
    </div>
  )
}

// Helper: format scan date
function formatScanDate(dateStr) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHrs < 24) return `${diffHrs}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}
