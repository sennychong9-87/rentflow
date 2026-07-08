import { cn } from '@/lib/utils'

export default function LoadingSpinner({ fullScreen = false, size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin',
        sizes[size]
      )} />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading RentFlow…</p>
        </div>
      </div>
    )
  }

  return spinner
}
