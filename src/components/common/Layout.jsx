import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="app-shell">
      <div className="app-frame">
        <Header />
        <main className="flex-1 w-full px-4 py-4 pb-20 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
