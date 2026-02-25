import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <Header />
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
