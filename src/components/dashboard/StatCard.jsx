import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * StatCard — dashboard metric block
 *
 * Usage:
 *   <StatCard
 *     icon={Users}
 *     label="Active tenants"
 *     value={12}
 *     sub="2 vacating"
 *     color="green"
 *     to="/dashboard/tenants"
 *     trend={{ value: 8, direction: 'up', label: 'vs last month' }}
 *   />
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'blue',
  to,
  trend,
  loading = false,
  className,
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  const content = (
    <div className={cn(
      'bg-white rounded-xl border border-slate-100 shadow-card p-5 transition-shadow',
      to && 'hover:shadow-card-hover',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        {to && <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-slate-100 rounded animate-pulse w-24" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-32" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
          <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}

          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-500'
            )}>
              {trend.direction === 'up'
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              <span>{trend.value}% {trend.label}</span>
            </div>
          )}
        </>
      )}
    </div>
  )

  if (to) return <Link to={to}>{content}</Link>
  return content
}
