import { cn } from '@/lib/utils'

/**
 * Button component
 *
 * Usage:
 *   <Button>Click me</Button>
 *   <Button variant="secondary" size="sm">Cancel</Button>
 *   <Button variant="danger" loading={saving}>Delete</Button>
 *   <Button variant="ghost" icon={<Plus />}>Add item</Button>
 */
export default function Button({
  children,
  variant = 'primary',   // primary | secondary | danger | ghost | outline
  size = 'md',           // sm | md | lg
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,                  // icon element rendered before children
  iconRight,             // icon element rendered after children
  className,
  onClick,
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
    danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    outline:   'border border-brand-500 text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  )
}
