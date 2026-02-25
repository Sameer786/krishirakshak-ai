import { Link, useLocation, useNavigate } from 'react-router-dom'
import useOnlineStatus from '../../hooks/useOnlineStatus'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isOnline } = useOnlineStatus()
  const isHome = location.pathname === '/'

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Back button or logo */}
        <div className="flex items-center gap-2">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg hover:bg-primary-dark/30 transition-colors"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🌾</span>
            <h1 className="text-lg font-bold leading-tight text-white">KrishiRakshak</h1>
          </Link>
        </div>

        {/* Right: Online status + demo badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" title={isOnline ? 'Online' : 'Offline'}>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-green-300 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="text-xs text-primary-200 hidden min-[360px]:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <span className="text-[10px] bg-primary-dark/50 px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
