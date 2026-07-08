import { cn } from '@/lib/utils'

/**
 * Card component
 *
 * Usage:
 *   <Card>Simple card</Card>
 *   <Card padding="lg" hover>Hoverable card</Card>
 *   <Card.Header title="Tenants" action={<Button>Add</Button>} />
 *   <Card.Section>Section with border</Card.Section>
 */
export default function Card({
  children,
  padding = 'md',    // none | sm | md | lg
  hover = false,
  className,
  onClick,
  ...props
}) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-5',
    lg:   'p-6',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-card',
        hover && 'hover:shadow-card-hover transition-shadow cursor-pointer',
        onClick && 'cursor-pointer',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Header subcomponent
Card.Header = function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}

// Section subcomponent — adds divider between sections
Card.Section = function CardSection({ children, className }) {
  return (
    <div className={cn('border-t border-slate-100 pt-4 mt-4', className)}>
      {children}
    </div>
  )
}

// Row subcomponent — label/value pairs
Card.Row = function CardRow({ label, value, className }) {
  return (
    <div className={cn('flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0', className)}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}

// Stat subcomponent
Card.Stat = function CardStat({ label, value, sub, icon: Icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
      {Icon && (
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}
