import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PAGE_TITLES = {
  '/dashboard':             'Dashboard',
  '/dashboard/properties':  'Properties',
  '/dashboard/tenants':     'Tenants',
  '/dashboard/rent':        'Rent Ledger',
  '/dashboard/maintenance': 'Maintenance',
  '/dashboard/messages':    'Messages',
  '/dashboard/documents':   'Documents',
  '/dashboard/settings':    'Settings',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { profile } = useAuth()

  // Match tenant detail route
  const title = PAGE_TITLES[pathname] || (pathname.startsWith('/dashboard/tenants/') ? 'Tenant Detail' : 'RentFlow')

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          {/* Unread dot — wire to real data later */}
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Plan badge */}
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-600 capitalize">
          {profile?.plan || 'free'} plan
        </span>
      </div>
    </header>
  )
}
