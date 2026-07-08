import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, DollarSign, Wrench, TrendingUp, AlertCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { usePropertyStore } from '@/store/propertyStore'
import { useTenantStore } from '@/store/tenantStore'
import { useMaintenance } from '@/hooks/useMaintenance'
import { useRentLedger } from '@/hooks/useRentLedger'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatRelative, getMonthName, getCurrentPeriod, TICKET_STATUS_STYLES, PRIORITY_STYLES } from '@/lib/utils'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

function StatCard({ icon: Icon, label, value, sub, color = 'blue', to }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
  }
  const card = (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {to && <ArrowRight className="w-4 h-4 text-slate-300" />}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{card}</Link> : card
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { properties, units, fetchProperties, loading: propLoading } = usePropertyStore()
  const { tenants, fetchTenants, loading: tenantLoading } = useTenantStore()
  const { tickets, openCount, emergencyCount } = useMaintenance()
  const { period } = getCurrentPeriod ? { period: getCurrentPeriod() } : { period: { month: new Date().getMonth() + 1, year: new Date().getFullYear() } }
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const { stats: rentStats, ledger } = useRentLedger(currentMonth, currentYear)

  useEffect(() => {
    fetchProperties()
    fetchTenants()
  }, [])

  const occupied = units.filter(u => u.status === 'occupied').length
  const vacant = units.filter(u => u.status === 'vacant').length
  const activeTenants = tenants.filter(t => t.status === 'active').length
  const recentTickets = tickets.slice(0, 5)

  if (propLoading && tenantLoading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">{getMonthName(currentMonth)} {currentYear} overview</p>
      </div>

      {/* Emergency alert */}
      {emergencyCount > 0 && (
        <Link to="/dashboard/maintenance" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 hover:bg-red-100 transition-colors">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span><strong>{emergencyCount} emergency ticket{emergencyCount > 1 ? 's' : ''}</strong> need immediate attention</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total units" value={units.length}
          sub={`${occupied} occupied · ${vacant} vacant`} color="blue" to="/dashboard/properties" />
        <StatCard icon={Users} label="Active tenants" value={activeTenants}
          sub={`${tenants.filter(t => t.status === 'vacating').length} vacating`} color="green" to="/dashboard/tenants" />
        <StatCard icon={DollarSign} label="Rent collected" value={formatCurrency(rentStats.totalCollected)}
          sub={`of ${formatCurrency(rentStats.totalDue)} due`} color={rentStats.lateCount > 0 ? 'yellow' : 'green'} to="/dashboard/rent" />
        <StatCard icon={Wrench} label="Open tickets" value={openCount}
          sub={emergencyCount > 0 ? `${emergencyCount} emergency` : 'No emergencies'} color={emergencyCount > 0 ? 'red' : 'blue'} to="/dashboard/maintenance" />
      </div>

      {/* Rent progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">Rent collection — {getMonthName(currentMonth)}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{rentStats.paidCount} of {ledger.length} tenants paid</p>
          </div>
          <Link to="/dashboard/rent" className="text-xs text-brand-600 hover:underline font-medium">View all</Link>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
          <div
            className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: rentStats.totalDue > 0 ? `${Math.min(100, (rentStats.totalCollected / rentStats.totalDue) * 100)}%` : '0%' }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="text-green-600 font-medium">{formatCurrency(rentStats.totalCollected)} collected</span>
          {rentStats.totalOutstanding > 0 && <span className="text-red-500 font-medium">{formatCurrency(rentStats.totalOutstanding)} outstanding</span>}
          {rentStats.lateCount > 0 && <span className="badge-red">{rentStats.lateCount} late</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent maintenance */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent maintenance</h3>
            <Link to="/dashboard/maintenance" className="text-xs text-brand-600 hover:underline font-medium">View all</Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
              <p className="text-sm">No open tickets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map(ticket => (
                <div key={ticket.id} className="flex items-start gap-3">
                  <span className={`badge mt-0.5 ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
                    <p className="text-xs text-slate-400">{ticket.tenants?.full_name} · {formatRelative(ticket.created_at)}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${TICKET_STATUS_STYLES[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming lease expirations + quick actions */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Quick actions</h3>
          <div className="space-y-2">
            {[
              { to: '/dashboard/properties', icon: Building2, label: 'Add a property', sub: 'Register a new building or unit' },
              { to: '/dashboard/tenants',    icon: Users,     label: 'Add a tenant',   sub: 'Onboard a new tenant' },
              { to: '/dashboard/rent',       icon: DollarSign,label: 'Record payment', sub: 'Mark rent as received' },
              { to: '/dashboard/maintenance',icon: Wrench,    label: 'View tickets',   sub: `${openCount} open right now` },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
