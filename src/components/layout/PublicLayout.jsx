import { Outlet, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">RentFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="btn-ghost">Pricing</Link>
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
