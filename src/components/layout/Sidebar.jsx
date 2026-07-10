import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, DollarSign,
  Wrench, MessageSquare, FileText, Settings, LogOut, Zap, Activity
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn, getInitials } from '@/lib/utils'

const ICONS = { LayoutDashboard, Building2, Users, DollarSign, Wrench, MessageSquare, FileText, Activity, Settings }

const NAV = [
  { to: '/dashboard',             label: 'Dashboard',   icon: 'LayoutDashboard', end: true },
  { to: '/dashboard/properties',  label: 'Properties',  icon: 'Building2' },
  { to: '/dashboard/tenants',     label: 'Tenants',     icon: 'Users' },
  { to: '/dashboard/rent',        label: 'Rent Ledger', icon: 'DollarSign' },
  { to: '/dashboard/maintenance', label: 'Maintenance', icon: 'Wrench' },
  { to: '/dashboard/messages',    label: 'Messages',    icon: 'MessageSquare' },
  { to: '/dashboard/documents',   label: 'Documents',   icon: 'FileText' },
  { to: '/dashboard/activity',    label: 'Activity Log', icon: 'Activity' },
]

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleNav = () => {
    onClose?.()
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-100 flex flex-col
        transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0 lg:flex-shrink-0 lg:h-full
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">RentFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon, end }) => {
          const Icon = ICONS[icon]
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleNav}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: settings + user */}
      <div className="border-t border-slate-100 p-3 space-y-0.5">
        <NavLink
          to="/dashboard/settings"
          onClick={handleNav}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-600 flex-shrink-0">
            {getInitials(profile?.full_name || 'U')}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{profile?.plan || 'free'} plan</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}
