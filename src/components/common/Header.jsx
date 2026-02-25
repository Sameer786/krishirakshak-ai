import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🌾</span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-white">KrishiRakshak</h1>
            <p className="text-xs text-primary-200 leading-tight">Farm Safety Assistant</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-primary-dark px-2 py-1 rounded-full">
            {import.meta.env.VITE_DEMO_MODE === 'true' ? 'DEMO' : 'LIVE'}
          </span>
        </div>
      </div>
    </header>
  )
}
