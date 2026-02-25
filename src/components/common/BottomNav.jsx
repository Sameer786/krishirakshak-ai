import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/voice', label: 'Voice QA', icon: '🎤' },
  { path: '/hazard', label: 'Hazard', icon: '⚠️' },
  { path: '/checklist', label: 'Checklist', icon: '📋' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs no-underline transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-gray-500 hover:text-primary-dark'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
