import { cn } from '@/lib/utils'

/**
 * TenantStatusBadge — colored badge for tenant status
 *
 * Usage:
 *   <TenantStatusBadge status="active" />
 *   <TenantStatusBadge status="vacating" size="lg" />
 */
export default function TenantStatusBadge({ status, size = 'sm' }) {
  const config = {
    active: {
      label: 'Active',
      className: 'bg-green-50 text-green-700',
      dot: 'bg-green-500',
    },
    vacating: {
      label: 'Vacating',
      className: 'bg-yellow-50 text-yellow-700',
      dot: 'bg-yellow-500',
    },
    vacated: {
      label: 'Vacated',
      className: 'bg-slate-100 text-slate-500',
      dot: 'bg-slate-400',
    },
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }

  const { label, className, dot } = config[status] || config.vacated

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      className,
      sizes[size]
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      {label}
    </span>
  )
}
