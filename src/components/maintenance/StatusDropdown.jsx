import { useState, useRef, useEffect } from 'react'
import { ChevronDown, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  {
    value: 'open',
    label: 'Open',
    description: 'Ticket is waiting to be addressed',
    icon: AlertCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    badge: 'badge-blue',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    description: 'Being worked on',
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    badge: 'badge-yellow',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    description: 'Issue has been fixed',
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50',
    badge: 'badge-green',
  },
  {
    value: 'closed',
    label: 'Closed',
    description: 'No further action needed',
    icon: XCircle,
    color: 'text-slate-400',
    bg: 'bg-slate-50',
    badge: 'badge-slate',
  },
]

/**
 * StatusDropdown — inline status selector for maintenance tickets
 *
 * Usage:
 *   <StatusDropdown
 *     value={ticket.status}
 *     onChange={(newStatus) => updateTicket(ticket.id, { status: newStatus })}
 *   />
 */
export default function StatusDropdown({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = OPTIONS.find(o => o.value === value) || OPTIONS[0]
  const Icon = current.icon

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (optionValue) => {
    onChange?.(optionValue)
    setOpen(false)
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
          'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500',
          current.bg,
          current.color,
          'border-transparent',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Icon className="w-4 h-4" />
        {current.label}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-100 shadow-lg z-20 overflow-hidden">
          {OPTIONS.map((opt) => {
            const OptIcon = opt.icon
            const isSelected = opt.value === value

            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors',
                  isSelected && 'bg-brand-50'
                )}
              >
                <OptIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', opt.color)} />
                <div>
                  <p className={cn('text-sm font-medium', isSelected ? 'text-brand-700' : 'text-slate-700')}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-400">{opt.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
