import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Input component
 *
 * Usage:
 *   <Input placeholder="Email" />
 *   <Input label="Full name" required />
 *   <Input label="Search" icon={<Search />} />
 *   <Input error="This field is required" />
 *   <Input as="textarea" rows={4} />
 *   <Input as="select"><option>One</option></Input>
 */
const Input = forwardRef(function Input({
  label,
  error,
  hint,
  icon,          // left icon
  iconRight,     // right icon
  as: Tag = 'input',
  className,
  required,
  children,
  ...props
}, ref) {
  const inputClass = cn(
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
    'placeholder:text-slate-400 transition-all',
    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
    'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60',
    error ? 'border-red-300 focus:ring-red-400' : 'border-slate-200',
    icon && 'pl-9',
    iconRight && 'pr-9',
    className
  )

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        <Tag ref={ref} className={inputClass} {...props}>
          {children}
        </Tag>

        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {iconRight}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
})

export default Input
