import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Voice Q&A',
    description: 'Ask safety questions in your language',
    icon: '🎤',
    path: '/voice',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    title: 'Hazard Detection',
    description: 'AI-powered photo hazard analysis',
    icon: '⚠️',
    path: '/hazard',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    title: 'Safety Checklist',
    description: 'Daily job hazard assessments',
    icon: '📋',
    path: '/checklist',
    color: 'bg-green-50 border-green-200',
  },
]

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-5 text-white shadow-md">
        <h2 className="text-lg font-bold mb-1">Namaste! 🙏</h2>
        <p className="text-sm text-primary-200">
          Your AI-powered farm safety assistant. Stay safe while working in the fields.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Features</h3>
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm no-underline transition-transform active:scale-[0.98] ${feature.color}`}
          >
            <span className="text-3xl">{feature.icon}</span>
            <div>
              <h4 className="font-semibold text-gray-800">{feature.title}</h4>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-xs text-gray-500">Hazards Detected</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-xs text-gray-500">Checklists Done</p>
        </div>
      </div>
    </div>
  )
}
