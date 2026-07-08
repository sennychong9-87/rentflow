import { cn } from '@/lib/utils'

/**
 * Badge component
 *
 * Usage:
 *   <Badge>Default</Badge>
 *   <Badge variant="green">Active</Badge>
 *   <Badge variant="red" dot>Late</Badge>
 *   <Badge variant="yellow" size="lg">Pending</Badge>
 */
export default function Badge({
  children,
  variant = 'slate',  // slate | green | red | yellow | blue | purple | orange
  size = 'sm',        // sm | md | lg
  dot = false,        // show colored dot before text
  className,
}) {
  const variants = {
    slate:  'bg-slate-100 text-slate-600',
    green:  'bg-green-50 text-green-700',
    red:    'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    blue:   'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }

  const dotColors = {
    slate:  'bg-slate-400',
    green:  'bg-green-500',
    red:    'bg-red-500',
    yellow: 'bg-yellow-500',
    blue:   'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

// Convenience exports for common statuses
export function StatusBadge({ status }) {
  const map = {
    active:      { variant: 'green',  label: 'Active' },
    inactive:    { variant: 'slate',  label: 'Inactive' },
    vacating:    { variant: 'yellow', label: 'Vacating' },
    vacated:     { variant: 'slate',  label: 'Vacated' },
    occupied:    { variant: 'green',  label: 'Occupied' },
    vacant:      { variant: 'slate',  label: 'Vacant' },
    maintenance: { variant: 'yellow', label: 'Maintenance' },
    paid:        { variant: 'green',  label: 'Paid' },
    pending:     { variant: 'slate',  label: 'Pending' },
    late:        { variant: 'red',    label: 'Late' },
    partial:     { variant: 'yellow', label: 'Partial' },
    waived:      { variant: 'blue',   label: 'Waived' },
    open:        { variant: 'blue',   label: 'Open' },
    in_progress: { variant: 'yellow', label: 'In Progress' },
    resolved:    { variant: 'green',  label: 'Resolved' },
    closed:      { variant: 'slate',  label: 'Closed' },
  }
  const { variant, label } = map[status] || { variant: 'slate', label: status }
  return <Badge variant={variant} dot>{label}</Badge>
}
