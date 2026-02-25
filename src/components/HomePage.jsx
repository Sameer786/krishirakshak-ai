import { Link } from 'react-router-dom'
import OfflineIndicator from './common/OfflineIndicator'

const SAFETY_TIPS = [
  'Always wear protective gloves when handling pesticides.',
  'Keep children away from farm machinery at all times.',
  'Store chemicals in labeled containers away from food and water.',
  'Take breaks every 2 hours when working in direct sunlight.',
  'Wear a mask when spraying fertilizers or pesticides.',
]

function getTodaysTip() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  )
  return SAFETY_TIPS[dayOfYear % SAFETY_TIPS.length]
}

const features = [
  {
    path: '/hazard-detection',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Hazard Detection',
    labelHi: 'खतरा पहचान',
    color: 'bg-amber-500',
  },
  {
    path: '/jha-checklist',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Safety Checklist',
    labelHi: 'सुरक्षा जांच',
    color: 'bg-primary',
  },
  {
    path: '#',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
      </svg>
    ),
    label: 'Compliance',
    labelHi: 'अनुपालन',
    color: 'bg-sky',
  },
]

export default function HomePage() {
  const tip = getTodaysTip()

  return (
    <div className="space-y-5">
      {/* Title Section */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-primary-dark">KrishiRakshak</h1>
        <p className="text-base text-primary-600 font-medium">कृषि रक्षक</p>
        <p className="text-xs text-gray-500 mt-1">AI-Powered Agricultural Safety Assistant</p>
      </div>

      {/* Voice Button — large central CTA */}
      <div className="flex justify-center py-4">
        <Link
          to="/voice-qa"
          className="no-underline group"
        >
          <div className="relative flex items-center justify-center w-[120px] h-[120px] rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-lg transition-all duration-200 active:scale-95 group-hover:shadow-xl">
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
            {/* Mic icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-12 h-12 relative z-10"
            >
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          </div>
          <p className="text-center text-sm font-semibold text-primary-dark mt-3">
            Tap to Speak
          </p>
          <p className="text-center text-xs text-gray-500">बोलने के लिए टैप करें</p>
        </Link>
      </div>

      {/* Feature Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        {features.map((f) => (
          <Link
            key={f.label}
            to={f.path}
            className="no-underline flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md min-h-[100px] justify-center"
          >
            <div className={`${f.color} text-white p-2.5 rounded-xl`}>
              {f.icon}
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{f.label}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{f.labelHi}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Safety Tip */}
      <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
        <div className="bg-primary-50 px-4 py-2 flex items-center gap-2 border-b border-primary-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
            <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
          </svg>
          <span className="text-xs font-semibold text-primary-dark">Today&apos;s Safety Tip</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <OfflineIndicator />
      </div>
    </div>
  )
}
